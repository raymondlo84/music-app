// Sequencer - Beat scheduling engine (16 steps, Web Audio API scheduler)
const Sequencer = (() => {
  let bpm = 95;
  let playing = false;
  let currentStep = -1;
  let nextStepTime = 0;
  let scheduleAheadTime = 0.1;
  let lookahead = 25;
  let timerID;
  let totalSteps = 16;

  // Per-track state: { muted, solo, volume, steps: [0/1 repeated 16] }
  let tracks = [];
  let onStepChange = null; // callback(step, time)
  let onPlayStateChange = null; // callback(isPlaying)

  // Beat patterns (each is 16-step array, 0=off, 1=on)
  const defaultPattern = {
    kick:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
    hihat:     [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    clap:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
    rim:       [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
    shaker:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    bass:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
  };

  const defaultNotes = {
    bass: [55, 0, 0, 0, 0, 0, 0, 0, 65.41, 0, 0, 0, 82.41, 0, 0, 0] // A1, C2, E2
  };

  function initTracks() {
    const instruments = ['kick', 'snare', 'hihat', 'clap', 'rim', 'shaker', 'bass'];
    tracks = instruments.map(name => ({
      name,
      muted: false,
      solo: false,
      volume: 0.8,
      steps: defaultPattern[name].slice(),
      notes: defaultNotes[name] || null
    }));
  }

  function getTrack(index) {
    return tracks[index];
  }

  function getTrackByName(name) {
    return tracks.find(t => t.name === name);
  }

  function getTrackIndex(name) {
    return tracks.indexOf(tracks.find(t => t.name === name));
  }

  // Toggle step on/off
  function toggleStep(trackName, stepIndex) {
    const track = getTrackByName(trackName);
    if (!track) return;
    track.steps[stepIndex] = track.steps[stepIndex] ? 0 : 1;
  }

  function setStep(trackName, stepIndex, value) {
    const track = getTrackByName(trackName);
    if (!track) return;
    track.steps[stepIndex] = value;
  }

  function setVolume(trackName, vol) {
    const track = getTrackByName(trackName);
    if (!track) return;
    track.volume = Math.max(0, Math.min(1, vol));
  }

  function setMute(trackName, muted) {
    const track = getTrackByName(trackName);
    if (!track) return;
    track.muted = muted;
  }

  function setSolo(trackName, solo) {
    const track = getTrackByName(trackName);
    if (!track) return;
    track.solo = solo;
  }

  function isAnySolo() {
    return tracks.some(t => t.solo);
  }

  function shouldPlay(track) {
    if (track.muted) return false;
    if (isAnySolo()) return track.solo;
    return true;
  }

  function playStep(trackName, stepIndex, time) {
    const synth = window.Synthesizer;
    if (!synth) return;

    // Find corresponding track
    let step = 0;
    for (let i = 0; i < 16; i++) {
      if (stepIndex % 16 === i && i === stepIndex % 16) {
        step = i;
        break;
      }
    }
    step = stepIndex % 16;

    const track = getTrackByName(trackName);
    if (!track || !track.steps[step]) return;
    if (!shouldPlay(track)) return;

    switch (trackName) {
      case 'kick':
        synth.kick(time, { gain: track.volume });
        break;
      case 'snare':
        synth.snare(time, { gain: track.volume });
        break;
      case 'hihat':
        synth.hihat(time, { gain: track.volume * 0.8 });
        break;
      case 'openHat':
        synth.openHat(time, { gain: track.volume * 0.6 });
        break;
      case 'clap':
        synth.clap(time, { gain: track.volume });
        break;
      case 'rim':
        synth.rim(time, { gain: track.volume });
        break;
      case 'shaker':
        synth.shaker(time, { gain: track.volume * 0.5 });
        break;
      case 'bass':
        if (track.notes && track.notes[step]) {
          synth.bass(time, {
            note: track.notes[step],
            duration: (60 / bpm / 4) * 3,
            gain: track.volume
          });
        }
        break;
    }
  }

  // Schedule a batch of steps ahead
  function schedule() {
    while (nextStepTime < AudioEngine.getContext().currentTime + scheduleAheadTime) {
      currentStep++;
      if (currentStep >= totalSteps) currentStep = 0;

      // Play all active tracks for this step
      tracks.forEach(track => {
        if (track.steps[currentStep % 16] && shouldPlay(track)) {
          // Schedule sound
          const step = currentStep % 16;
          switch (track.name) {
            case 'kick':
              Synthesizer.kick(nextStepTime, { gain: track.volume * 1.2 });
              break;
            case 'snare':
              Synthesizer.snare(nextStepTime, { gain: track.volume });
              break;
            case 'hihat':
              Synthesizer.hihat(nextStepTime, { gain: track.volume * 0.7 });
              break;
            case 'clap':
              Synthesizer.clap(nextStepTime, { gain: track.volume });
              break;
            case 'rim':
              Synthesizer.rim(nextStepTime, { gain: track.volume });
              break;
            case 'shaker':
              Synthesizer.shaker(nextStepTime, { gain: track.volume * 0.4 });
              break;
            case 'bass':
              if (track.notes && track.notes[step]) {
                Synthesizer.bass(nextStepTime, {
                  note: track.notes[step],
                  duration: (60 / bpm / 4) * 3,
                  gain: track.volume * 0.9
                });
              }
              break;
          }
        }
      });

      // Notify UI on step change
      if (onStepChange) {
        onStepChange(currentStep % 16, nextStepTime);
      }

      nextStepTime += (60 / bpm / 4);
    }
  }

  function start() {
    if (playing) return;
    AudioEngine.resume();
    const ctx = AudioEngine.getContext();
    playing = true;
    currentStep = -1;
    nextStepTime = ctx.currentTime + 0.05;
    timerID = setInterval(schedule, lookahead);
    if (onPlayStateChange) onPlayStateChange(true);
  }

  function stop() {
    playing = false;
    currentStep = -1;
    if (timerID) {
      clearInterval(timerID);
      timerID = null;
    }
    if (onPlayStateChange) onPlayStateChange(false);
  }

  function toggle() {
    if (playing) stop(); else start();
  }

  function setBPM(val) {
    bpm = Math.max(60, Math.min(200, val));
  }

  function onStep(callback) { onStepChange = callback; }
  function onPlayState(callback) { onPlayStateChange = callback; }

  function getTotalSteps() { return totalSteps; }

  return {
    initTracks, start, stop, toggle, shouldPlay,
    toggleStep, setStep, setVolume, setMute, setSolo,
    getTrack, getTrackByName, getTrackIndex, setBPM,
    onStep, onPlayState, getTotalSteps,
    getCurrentStep: () => (currentStep % 16),
    isPlaying: () => playing,
    getBPM: () => bpm,
    getTracks: () => tracks
  };
})();

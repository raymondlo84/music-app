// UI - Uses existing DOM from index.html. No createElement for layout elements.
const SequencerUI = (() => {

  // ---- Pattern presets (6 genres, 16 steps per track) ----
  const PRESETS = {
    boomBap: {
      bpm: 90,
      tracks: {
        kick:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        hihat:     [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        rim:       [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
        shaker:    [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
        bass:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
      }
    },
    boom: {
      bpm: 95,
      tracks: {
        kick:      [1,0,0,0, 0,0,0,0, 1,1,0,0, 0,0,1,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        hihat:     [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        rim:       [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
        shaker:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
        bass:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
      }
    },
    trap: {
      bpm: 145,
      tracks: {
        kick:      [1,0,0,0, 0,0,0,1, 0,0,1,0, 0,0,0,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        hihat:     [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,1, 0,0,0,0],
        rim:       [0,0,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,0],
        shaker:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0],
        bass:      [1,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
      }
    },
    drill: {
      bpm: 140,
      tracks: {
        kick:      [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        hihat:     [1,0,1,0, 1,1,1,0, 1,0,1,0, 1,0,1,1],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        rim:       [0,0,0,0, 1,0,0,1, 0,0,0,0, 0,1,0,0],
        shaker:    [0,0,0,0, 1,0,0,0, 0,0,1,0, 0,0,1,0],
        bass:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
      }
    },
    lofi: {
      bpm: 80,
      tracks: {
        kick:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        hihat:     [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        rim:       [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
        shaker:    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        bass:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
      }
    },
    '90s': {
      bpm: 92,
      tracks: {
        kick:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        hihat:     [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        rim:       [0,0,0,1, 0,0,0,0, 0,0,1,0, 0,0,0,1],
        shaker:    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
        bass:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
      }
    }
  };

  const TRACK_NAMES = ['kick', 'snare', 'hihat', 'clap', 'rim', 'shaker', 'bass'];

  // ---- FX state ----
  let fxState = { reverb: 20, delay: 0, distortion: 0, filter: 10000 };

  // ---- init: wire ALL existing DOM elements ----
  function init() {
    // ---- Transport buttons ----
    const btnPlay = document.getElementById('btn-play');
    const btnStop = document.getElementById('btn-stop');
    const btnPunch = document.getElementById('btn-punch');

    btnPlay.addEventListener('click', () => {
      Sequencer.toggle();
    });
    btnStop.addEventListener('click', () => {
      Sequencer.stop();
    });
    btnPunch.addEventListener('click', () => {
      // Punch-in: restart from current position
      Sequencer.stop();
      setTimeout(() => {
        Sequencer.start();
      }, 50);
    });

    // ---- BPM slider ----
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmValue = document.getElementById('bpm-value');
    bpmSlider.addEventListener('input', () => {
      const bpm = parseInt(bpmSlider.value);
      Sequencer.setBPM(bpm);
      bpmValue.textContent = bpm;
    });

    // ---- Swing slider ----
    const swingSlider = document.getElementById('swing-slider');
    const swingValue = document.getElementById('swing-value');
    swingSlider.addEventListener('input', () => {
      const v = parseInt(swingSlider.value);
      Sequencer.setSwing(v);
      swingValue.textContent = v + '%';
    });

    // ---- Pattern selector ----
    const patternSelect = document.getElementById('pattern-select');
    patternSelect.addEventListener('change', () => {
      loadPattern(patternSelect.value);
    });

    // ---- Randomize ----
    const btnRandomize = document.getElementById('btn-randomize');
    btnRandomize.addEventListener('click', () => {
      randomizePattern();
    });

    // ---- Save pattern ----
    const btnSave = document.getElementById('btn-save-pattern');
    btnSave.addEventListener('click', () => {
      savePattern();
    });

    // ---- Load pattern (dialog) ----
    const btnLoad = document.getElementById('btn-load-pattern');
    btnLoad.addEventListener('click', () => {
      showLoadDialog();
    });

    // ---- FX sliders ----
    const fxMap = {
      reverb:   { el: 'fx-reverb',   defaultVal: 20,   displayFn: v => v + '%' },
      delay:    { el: 'fx-delay',    defaultVal: 0,    displayFn: v => v + '%' },
      distortion: { el: 'fx-distortion', defaultVal: 0, displayFn: v => v + '%' },
      filter:   { el: 'fx-filter',   defaultVal: 10000, displayFn: v => v >= 10000 ? 'ALL' : v }
    };

    Object.entries(fxMap).forEach(([fxKey, cfg]) => {
      const input = document.querySelector(`input[data-fx="${fxKey}"]`);
      const display = document.getElementById(cfg.el);
      if (!input || !display) return;

      fxState[fxKey] = parseInt(input.value);
      display.textContent = cfg.displayFn(fxState[fxKey]);

      input.addEventListener('input', () => {
        let val = parseInt(input.value);
        fxState[fxKey] = val;
        display.textContent = cfg.displayFn(val);
        applyFX(fxKey, val);
      });
    });

    // ---- Step display ----
    const stepDisplay = document.getElementById('step-display');
    Sequencer.onStep((step) => {
      if (stepDisplay) stepDisplay.textContent = step + 1;
      updateStepHighlight(step);
    });

    Sequencer.onPlayState((playing) => {
      if (btnPlay) {
        btnPlay.textContent = playing ? '⏸ PAUSE' : '▶ PLAY';
        btnPlay.classList.toggle('active', playing);
      }
    });

    // ---- Render saved patterns list ----
    renderSavedPatterns();
  }

  // ---- buildGrid: create track rows inside existing #sequencer-grid ----
  function buildGrid() {
    const grid = document.getElementById('sequencer-grid');
    const stepNums = document.getElementById('step-numbers');
    if (!grid || !stepNums) return;

    // Step numbers: 100px placeholder (matches track-info width) + 16 numbered slots
    stepNums.innerHTML = '<div class="step-num-placeholder"></div>' +
      '<div class="step-num-group">' +
      Array.from({length: 16}, (_, i) =>
        `<span class="step-num${i % 4 === 0 ? ' beat' : ''}" data-step="${i}">${i + 1}</span>`
      ).join('') + '</div>';

    // Track rows
    grid.innerHTML = '';
    const tracks = Sequencer.getTracks();

    tracks.forEach((track) => {
      const row = document.createElement('div');
      row.className = 'track-row';

      // Track label + controls
      const trackInfo = document.createElement('div');
      trackInfo.className = 'track-info';

      const nameEl = document.createElement('span');
      nameEl.className = 'track-name';
      nameEl.textContent = track.name.toUpperCase();

      const controls = document.createElement('div');
      controls.className = 'track-controls';

      const muteBtn = document.createElement('button');
      muteBtn.className = 'btn-mute';
      muteBtn.dataset.track = track.name;
      muteBtn.title = 'Mute';
      muteBtn.textContent = 'M';
      if (track.muted) muteBtn.classList.add('muted');
      muteBtn.addEventListener('click', (e) => {
        const tn = e.target.dataset.track;
        const t = Sequencer.getTrackByName(tn);
        if (t) {
          t.muted = !t.muted;
          e.target.classList.toggle('muted', t.muted);
          e.target.closest('.track-row').style.opacity = t.muted ? 0.4 : 1;
        }
      });

      const soloBtn = document.createElement('button');
      soloBtn.className = 'btn-solo';
      soloBtn.dataset.track = track.name;
      soloBtn.title = 'Solo';
      soloBtn.textContent = 'S';
      if (track.solo) soloBtn.classList.add('active');
      soloBtn.addEventListener('click', (e) => {
        const tn = e.target.dataset.track;
        const t = Sequencer.getTrackByName(tn);
        if (t) {
          t.solo = !t.solo;
          e.target.classList.toggle('active', t.solo);
        }
      });

      const volSlider = document.createElement('input');
      volSlider.type = 'range';
      volSlider.className = 'volume-slider';
      volSlider.min = '0';
      volSlider.max = '100';
      volSlider.value = Math.round(track.volume * 100);
      volSlider.dataset.track = track.name;

      const volLabel = document.createElement('span');
      volLabel.className = 'volume-label';
      volLabel.textContent = Math.round(track.volume * 100) + '%';

      volSlider.addEventListener('input', (e) => {
        const tn = e.target.dataset.track;
        const vol = parseInt(e.target.value) / 100;
        Sequencer.setVolume(tn, vol);
        const lbl = e.target.closest('.track-row').querySelector('.volume-label');
        if (lbl) lbl.textContent = Math.round(vol * 100) + '%';
      });

      controls.appendChild(muteBtn);
      controls.appendChild(soloBtn);
      controls.appendChild(volSlider);
      trackInfo.appendChild(nameEl);
      trackInfo.appendChild(controls);

      // Step buttons
      const stepsDiv = document.createElement('div');
      stepsDiv.className = 'track-steps';

      for (let i = 0; i < 16; i++) {
        const btn = document.createElement('button');
        btn.className = 'step-btn';
        if (track.steps[i]) btn.classList.add('active');
        if (i % 4 === 0) btn.classList.add('downbeat');
        btn.dataset.track = track.name;
        btn.dataset.step = i;

        btn.addEventListener('click', () => {
          Sequencer.toggleStep(track.name, i);
          btn.classList.toggle('active', Sequencer.getTrackByName(track.name).steps[i]);
          // Preview sound
          const ctx = AudioEngine.getContext();
          if (Sequencer.getTrackByName(track.name).steps[i] && !Sequencer.getTrackByName(track.name).muted) {
            playPreview(track.name, ctx.currentTime, track.volume);
          }
        });

        stepsDiv.appendChild(btn);
      }

      row.appendChild(trackInfo);
      row.appendChild(stepsDiv);
      grid.appendChild(row);
    });
  }

  // ---- playPreview: trigger a sound for click feedback ----
  function playPreview(trackName, time, volume) {
    const synth = window.Synthesizer;
    if (!synth) return;
    switch (trackName) {
      case 'kick':     synth.kick(time, { gain: volume * 0.8 }); break;
      case 'snare':    synth.snare(time, { gain: volume * 0.8 }); break;
      case 'hihat':    synth.hihat(time, { gain: volume * 0.5 }); break;
      case 'clap':     synth.clap(time, { gain: volume * 0.8 }); break;
      case 'rim':      synth.rim(time, { gain: volume * 0.8 }); break;
      case 'shaker':   synth.shaker(time, { gain: volume * 0.4 }); break;
      case 'bass':     synth.bass(time, { note: 55, duration: 0.2, gain: volume * 0.7 }); break;
    }
  }

  // ---- updateStepHighlight ----
  function updateStepHighlight(currentStep) {
    document.querySelectorAll('.step-btn').forEach(btn => {
      if (parseInt(btn.dataset.step) === currentStep) {
        btn.classList.add('playing');
      } else {
        btn.classList.remove('playing');
      }
    });
    document.querySelectorAll('.step-num').forEach(span => {
      if (parseInt(span.dataset.step) === currentStep) {
        span.style.color = '#00ff88';
      } else {
        span.style.color = '';
      }
    });
  }

  // ---- loadPattern: apply preset by name ----
  function loadPattern(name) {
    const preset = PRESETS[name];
    if (!preset) return;

    Sequencer.setBPM(preset.bpm);
    document.getElementById('bpm-value').textContent = preset.bpm;
    document.getElementById('bpm-slider').value = preset.bpm;

    Object.entries(preset.tracks).forEach(([trackName, steps]) => {
      steps.forEach((val, i) => {
        Sequencer.setStep(trackName, i, val);
      });
    });

    // Rebuild grid to reflect new steps
    buildGrid();

    // Select the dropdown
    const sel = document.getElementById('pattern-select');
    if (sel) sel.value = name;
  }

  // ---- randomizePattern: generate random 16-step patterns per genre ----
  function randomizePattern() {
    const presetNames = Object.keys(PRESETS);
    const genreKey = presetNames[Math.floor(Math.random() * presetNames.length)];
    const base = PRESETS[genreKey];

    // Randomize with genre-appropriate density
    const densityMap = {
      boomBap: { kick: 0.25, snare: 0.15, hihat: 0.75, clap: 0.15, rim: 0.25, shaker: 0.2, bass: 0.25 },
      boom:    { kick: 0.3,  snare: 0.15, hihat: 0.4,  clap: 0.15, rim: 0.25, shaker: 0.3, bass: 0.25 },
      trap:    { kick: 0.2,  snare: 0.12, hihat: 0.9,  clap: 0.12, rim: 0.3,  shaker: 0.2, bass: 0.2 },
      drill:   { kick: 0.2,  snare: 0.1,  hihat: 0.8,  clap: 0.1,  rim: 0.2,  shaker: 0.2, bass: 0.2 },
      lofi:    { kick: 0.2,  snare: 0.12, hihat: 0.6,  clap: 0.1,  rim: 0.1,  shaker: 0.2, bass: 0.2 },
      '90s':   { kick: 0.25, snare: 0.15, hihat: 0.7,  clap: 0.15, rim: 0.2,  shaker: 0.25, bass: 0.25 }
    };

    const dens = densityMap[genreKey] || densityMap.boomBap;

    TRACK_NAMES.forEach(trackName => {
      for (let i = 0; i < 16; i++) {
        const on = Math.random() < dens[trackName];
        Sequencer.setStep(trackName, i, on ? 1 : 0);
      }
    });

    Sequencer.setBPM(base.bpm);
    document.getElementById('bpm-value').textContent = base.bpm;
    document.getElementById('bpm-slider').value = base.bpm;

    buildGrid();
  }

  // ---- savePattern: store current state to localStorage ----
  function savePattern() {
    const tracks = Sequencer.getTracks();
    const state = {
      name: 'My Beat #' + (savedPatterns().length + 1),
      bpm: Sequencer.getBPM(),
      fx: { ...fxState },
      tracks: {}
    };
    tracks.forEach(t => {
      state.tracks[t.name] = t.steps.slice();
    });

    const saved = savedPatterns();
    saved.push(state);
    localStorage.setItem('musicApp_savedPatterns', JSON.stringify(saved));
    renderSavedPatterns();
  }

  function savedPatterns() {
    try {
      return JSON.parse(localStorage.getItem('musicApp_savedPatterns') || '[]');
    } catch { return []; }
  }

  function loadPatternFromStorage(index) {
    const saved = savedPatterns();
    const entry = saved[index];
    if (!entry) return;

    Sequencer.setBPM(entry.bpm);
    document.getElementById('bpm-value').textContent = entry.bpm;
    document.getElementById('bpm-slider').value = entry.bpm;

    Object.entries(entry.tracks).forEach(([trackName, steps]) => {
      steps.forEach((val, i) => {
        Sequencer.setStep(trackName, i, val);
      });
    });

    // Restore FX
    fxState = { ...entry.fx };
    const fxMap = {
      reverb: { el: 'fx-reverb',   input: "input[data-fx='reverb']" },
      delay:  { el: 'fx-delay',    input: "input[data-fx='delay']" },
      distortion: { el: 'fx-distortion', input: "input[data-fx='distortion']" },
      filter: { el: 'fx-filter',   input: "input[data-fx='filter']" }
    };
    Object.entries(fxMap).forEach(([key, cfg]) => {
      const val = entry.fx[key];
      if (val !== undefined) {
        fxState[key] = val;
        const input = document.querySelector(cfg.input);
        const display = document.getElementById(cfg.el);
        if (input) input.value = val;
        if (display) {
          display.textContent = key === 'filter' ? (val >= 10000 ? 'ALL' : val) : val + '%';
        }
        applyFX(key, val);
      }
    });

    buildGrid();
  }

  function showLoadDialog() {
    const saved = savedPatterns();
    if (saved.length === 0) {
      alert('No saved patterns. Save one first!');
      return;
    }
    const item = prompt(
      'Enter pattern number to load (0-' + (saved.length - 1) + '):\n' +
      saved.map((s, i) => i + ': ' + s.name).join('\n')
    );
    if (item !== null) {
      const idx = parseInt(item);
      if (!isNaN(idx) && idx >= 0 && idx < saved.length) {
        loadPatternFromStorage(idx);
      }
    }
  }

  // ---- renderSavedPatterns: show saved list with click-to-load ----
  function renderSavedPatterns() {
    const list = document.getElementById('saved-list');
    if (!list) return;

    const saved = savedPatterns();

    if (saved.length === 0) {
      list.innerHTML = '<p class="empty-msg">No saved patterns yet. Hit 💾 SAVE!</p>';
      return;
    }

    list.innerHTML = '';
    saved.forEach((entry, i) => {
      const div = document.createElement('div');
      div.className = 'saved-pattern-item';
      div.textContent = entry.name + ' (' + entry.bpm + ' BPM)';
      div.title = 'Click to load';
      div.addEventListener('click', () => {
        loadPatternFromStorage(i);
      });
      list.appendChild(div);
    });
  }

  // ---- applyFX: apply FX parameter change ----
  function applyFX(fxKey, value) {
    switch (fxKey) {
      case 'reverb': {
        const wet = value / 100 * 0.7;
        if (AudioEngine.getReverbWet()) {
          AudioEngine.getReverbWet().gain.value = wet;
        }
        break;
      }
      case 'delay': {
        const wet = value / 100 * 0.5;
        if (AudioEngine.getDelayWet()) {
          AudioEngine.getDelayWet().gain.value = wet;
        }
        break;
      }
      case 'distortion': {
        if (AudioEngine.getDistortionCurve()) {
          const amount = value / 100;
          buildDistortionCurve(AudioEngine.getDistortionCurve(), amount);
        }
        break;
      }
      case 'filter': {
        if (AudioEngine.getFilterNode()) {
          AudioEngine.getFilterNode().frequency.value = value;
        }
        break;
      }
    }
  }

  function buildDistortionCurve(curve, amount) {
    const k = amount * 100;
    const samples = 44100;
    for (let i = 0; i < samples; i++) {
      const x = i * 2 / samples - 1;
      curve[i] = x < 0
        ? ((3 + k) * x * 20 * (Math.PI / 180)) / (1 + 3 * k * Math.abs(x))
        : (Math.PI + k * x) / (Math.PI + k);
    }
  }

  // ---- Init FX chain on AudioEngine ----
  function initFX() {
    const ctx = AudioEngine.getContext();

    // Reverb convolver
    const convolver = ctx.createConvolver();
    const rate = ctx.sampleRate;
    const length = rate * 2;
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    convolver.buffer = impulse;

    const reverbWet = ctx.createGain();
    reverbWet.gain.value = fxState.reverb / 100 * 0.7;

    const reverbDry = ctx.createGain();
    reverbDry.gain.value = 1.0;

    const reverbMerge = ctx.createGain();

    const masterGain = AudioEngine.getMasterGain();
    masterGain.connect(reverbDry);
    masterGain.connect(convolver);
    convolver.connect(reverbWet);

    reverbDry.connect(reverbMerge);
    reverbWet.connect(reverbMerge);

    // Wire: reverbMerge -> delayDry -> filter -> analyser
    const delayDry = ctx.createGain();
    delayDry.gain.value = 1.0;
    reverbMerge.connect(delayDry);

    // Delay
    const delayNode = ctx.createDelay(5.0);
    delayNode.delayTime.value = 0.3;

    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.3;

    const delayWet = ctx.createGain();
    delayWet.gain.value = fxState.delay / 100 * 0.5;

    const delayMerge = ctx.createGain();

    delayDry.connect(delayMerge);
    delayDry.connect(delayNode);
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayNode.connect(delayWet);
    delayWet.connect(delayMerge);

    // Distortion waveshaper
    const waveshaper = ctx.createWaveShaper();
    buildDistortionCurve(waveshaper.curve, 0);
    waveshaper.oversample = '2x';

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = fxState.filter;
    filterNode.Q.value = 1;

    delayMerge.connect(waveshaper);
    waveshaper.connect(filterNode);

    const analyser = AudioEngine.getAnalyser();
    filterNode.connect(analyser);
    analyser.connect(ctx.destination);

    // Store references
    AudioEngine.setReverbWet(reverbWet);
    AudioEngine.setDelayWet(delayWet);
    AudioEngine.setDistortionCurve(waveshaper.curve);
    AudioEngine.setFilterNode(filterNode);
  }

  return {
    init, buildGrid, updateStepHighlight, loadPattern,
    randomizePattern, savePattern, savedPatterns,
    loadPatternFromStorage, renderSavedPatterns,
    initFX, fxState
  };
})();

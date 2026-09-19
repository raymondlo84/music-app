// UI - Grid rendering, controls, visual feedback
const SequencerUI = (() => {
  let gridContainer = null;
  let controlsContainer = null;

  function init() {
    const app = document.getElementById('app');
    if (!app) return;

    // Header
    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `
      <h1>RAP STUDIO</h1>
      <p class="subtitle">Beat Sequencer</p>
    `;
    app.appendChild(header);

    // Transport controls
    const transport = document.createElement('div');
    transport.className = 'transport';
    transport.innerHTML = `
      <button id="btn-play" class="btn btn-play">▶ PLAY</button>
      <button id="btn-stop" class="btn btn-stop">■ STOP</button>
      <div class="bpm-control">
        <label for="bpm-slider">BPM</label>
        <input type="range" id="bpm-slider" min="60" max="200" value="95">
        <span id="bpm-value">95</span>
      </div>
      <div class="step-indicator" id="step-display">-</div>
    `;
    app.appendChild(transport);

    // Step number display
    const stepDisplay = transport.querySelector('#step-display');
    const stepNumbers = document.createElement('div');
    stepNumbers.className = 'step-numbers';
    for (let i = 0; i < 16; i++) {
      const span = document.createElement('span');
      span.className = 'step-num';
      span.textContent = i + 1;
      if ((i + 1) % 4 === 0) span.classList.add('beat');
      stepNumbers.appendChild(span);
    }
    app.appendChild(stepNumbers);

    // Beat grid
    gridContainer = document.createElement('div');
    gridContainer.className = 'sequencer-grid';
    app.appendChild(gridContainer);

    // Connect events
    transport.querySelector('#btn-play').addEventListener('click', () => {
      Sequencer.toggle();
    });
    transport.querySelector('#btn-stop').addEventListener('click', () => {
      Sequencer.stop();
    });
    transport.querySelector('#bpm-slider').addEventListener('input', (e) => {
      const bpm = parseInt(e.target.value);
      Sequencer.setBPM(bpm);
      transport.querySelector('#bpm-value').textContent = bpm;
    });

    Sequencer.onStep((step, time) => {
      stepDisplay.textContent = step + 1;
      updateStepHighlight(step);
    });

    Sequencer.onPlayState((playing) => {
      const btnPlay = transport.querySelector('#btn-play');
      btnPlay.textContent = playing ? '⏸ PAUSE' : '▶ PLAY';
      btnPlay.classList.toggle('active', playing);
    });
  }

  function buildGrid() {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const tracks = Sequencer.getTracks();
    const totalSteps = Sequencer.getTotalSteps();

    tracks.forEach((track, trackIndex) => {
      const row = document.createElement('div');
      row.className = 'track-row';

      // Track label + controls
      const trackInfo = document.createElement('div');
      trackInfo.className = 'track-info';
      trackInfo.innerHTML = `
        <span class="track-name">${track.name.toUpperCase()}</span>
        <div class="track-controls">
          <button class="btn-mute" data-track="${track.name}" title="Mute">M</button>
          <button class="btn-solo" data-track="${track.name}" title="Solo">S</button>
          <input type="range" class="volume-slider" min="0" max="100" value="${track.volume * 100}" data-track="${track.name}">
        </div>
      `;
      row.appendChild(trackInfo);

      // Step buttons
      const stepsDiv = document.createElement('div');
      stepsDiv.className = 'track-steps';

      for (let i = 0; i < totalSteps; i++) {
        const btn = document.createElement('button');
        btn.className = 'step-btn';
        btn.dataset.track = track.name;
        btn.dataset.step = i;
        if (track.steps[i]) btn.classList.add('active');
        if (i % 4 === 0) btn.classList.add('downbeat');
        stepsDiv.appendChild(btn);

        btn.addEventListener('click', () => {
          Sequencer.toggleStep(track.name, i);
          // Play the sound for feedback
          const ctx = AudioEngine.getContext();
          // Update UI immediately
          btn.classList.toggle('active', track.steps[i]);
          // Brief preview sound
          if (track.steps[i] && !track.muted) {
            playPreview(track.name, ctx.currentTime, track.volume);
          }
        });
      }

      row.appendChild(stepsDiv);
      gridContainer.appendChild(row);
    });

    // Attach volume/mute/solo listeners
    document.querySelectorAll('.volume-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const trackName = e.target.dataset.track;
        const vol = parseInt(e.target.value) / 100;
        Sequencer.setVolume(trackName, vol);
      });
    });

    document.querySelectorAll('.btn-mute').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trackName = e.target.dataset.track;
        const track = Sequencer.getTrackByName(trackName);
        const muted = !track.muted;
        track.muted = muted;
        e.target.classList.toggle('muted', muted);
        // Dim the row
        const row = btn.closest('.track-row');
        row.style.opacity = muted ? 0.4 : 1;
      });
    });

    document.querySelectorAll('.btn-solo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trackName = e.target.dataset.track;
        const track = Sequencer.getTrackByName(trackName);
        const solo = !track.solo;
        track.solo = solo;
        e.target.classList.toggle('active', solo);
      });
    });
  }

  function playPreview(trackName, time, volume) {
    if (!window.Synthesizer) return;
    switch (trackName) {
      case 'kick': Synthesizer.kick(time, { gain: volume * 0.8 }); break;
      case 'snare': Synthesizer.snare(time, { gain: volume * 0.8 }); break;
      case 'hihat': Synthesizer.hihat(time, { gain: volume * 0.5 }); break;
      case 'clap': Synthesizer.clap(time, { gain: volume * 0.8 }); break;
      case 'rim': Synthesizer.rim(time, { gain: volume * 0.8 }); break;
      case 'shaker': Synthesizer.shaker(time, { gain: volume * 0.4 }); break;
      case 'bass': Synthesizer.bass(time, { note: 55, duration: 0.2, gain: volume * 0.7 }); break;
    }
  }

  function updateStepHighlight(currentStep) {
    document.querySelectorAll('.step-btn').forEach(btn => {
      if (parseInt(btn.dataset.step) === currentStep) {
        btn.classList.add('playing');
      } else {
        btn.classList.remove('playing');
      }
    });
  }

  function loadPattern(name) {
    const patterns = {
      boom: {
        kick:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        hihat:     [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        rim:       [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
        shaker:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
        bass:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
      },
      boomBap: {
        kick:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        hihat:     [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        rim:       [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
        shaker:    [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
        bass:      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
      },
      trap: {
        kick:      [1,0,0,0, 0,0,0,1, 0,0,1,0, 0,0,0,0],
        snare:     [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        hihat:     [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
        clap:      [0,0,0,0, 1,0,0,0, 0,0,0,1, 0,0,0,0],
        rim:       [0,0,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,0],
        shaker:    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0],
        bass:      [1,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0]
      }
    };

    const pattern = patterns[name];
    if (!pattern) return;

    Object.entries(pattern).forEach(([trackName, steps]) => {
      steps.forEach((val, i) => {
        Sequencer.setStep(trackName, i, val);
      });
    });

    // Update BPM
    const bpsMap = { boom: 95, boomBap: 90, trap: 145 };
    if (bpsMap[name]) Sequencer.setBPM(bpsMap[name]);

    buildGrid();
  }

  return { init, buildGrid, updateStepHighlight, loadPattern };
})();

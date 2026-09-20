// Main.js - Wires all modules together
(function() {
  // Expose for synth
  window.Synthesizer = Synthesizer;

  // Initialize
  AudioEngine.init();
  Sequencer.initTracks();

  // Wire UI using existing DOM elements
  SequencerUI.init();
  SequencerUI.buildGrid();

  // Init FX chain after audio context exists
  SequencerUI.initFX();

  // Load default pattern
  SequencerUI.loadPattern('boomBap');


  // Pattern selector
  const select = document.getElementById('pattern-select');
  if (select) {
    select.addEventListener('change', (e) => {
      SequencerUI.loadPattern(e.target.value);
    });
  }

  // Lazy-init audio context on first user gesture
  let audioInitialized = false;
  document.addEventListener('click', function initAudioOnce() {
    if (!audioInitialized) {
      AudioEngine.resume();
      audioInitialized = true;
    }
    // Remove this listener so it only fires once
    document.removeEventListener('click', initAudioOnce, true);
  }, true);
})();

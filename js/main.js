// Main.js - Wires all modules together
(function() {
  // Initialize audio engine on first interaction
  document.addEventListener('click', () => {
    AudioEngine.init();
    window.removeEventListener('click', arguments.callee, true);
  }, true);

  // Expose for synth
  window.Synthesizer = Synthesizer;

  // Initialize
  AudioEngine.init();
  Sequencer.initTracks();
  SequencerUI.init();
  SequencerUI.buildGrid();

  // Load default pattern
  SequencerUI.loadPattern('boomBap');

  // Pattern selector
  const select = document.getElementById('pattern-select');
  if (select) {
    select.addEventListener('change', (e) => {
      SequencerUI.loadPattern(e.target.value);
    });
  }
})();

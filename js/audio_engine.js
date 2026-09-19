/**
 * Audio Engine Module
 * Web Audio API context management, master chain, analyser for visualization
 */
const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let compressor = null;
  let analyser = null;
  let trackGains = {};
  let trackMutes = {};

  function init() {
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;

    try {
      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -20;
      compressor.knee.value = 10;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.1;
    } catch (e) {
      compressor = ctx.createGain();
      compressor.gain.value = 1;
    }

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // Analyser for visualizer
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.3;
    masterGain.connect(analyser);

    return ctx;
  }

  function getContext() {
    if (!ctx) init();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function getMasterGain() { return masterGain; }
  function getAnalyser() { return analyser; }

  function getTrackGain(name) {
    if (!trackGains[name]) {
      const g = ctx.createGain();
      g.gain.value = 1.0;
      g.connect(masterGain);
      trackGains[name] = g;
    }
    return trackGains[name];
  }

  function setTrackMute(name, muted) {
    trackMutes[name] = muted;
    const g = getTrackGain(name);
    if (g) g.gain.value = muted ? 0 : 1;
  }

  function isTrackMuted(name) {
    return trackMutes[name] || false;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  return { init, getContext, getMasterGain, getAnalyser, getTrackGain, setTrackMute, isTrackMuted, resume };
})();

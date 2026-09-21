/**
 * Audio Engine Module
 * Web Audio API context management, master chain, analyser, FX chain
 */
const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let compressor = null;
  let analyser = null;
  let trackGains = {};
  let trackMutes = {};

  // FX chain nodes (wired by UI.initFX)
  let _reverbWet = null;
  let _reverbDry = null;
  let _delayWet = null;
  let _delayNode = null;
  let _distortionCurve = null;
  let _filterNode = null;

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

    // Analyser for visualizer
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3;

    // Master chain: masterGain -> compressor -> analyser -> destination
    masterGain.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(ctx.destination);

    return ctx;
  }

  function getContext() {
    if (!ctx) init();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function getMasterGain() { return masterGain; }
  function getAnalyser() { return analyser; }

  // FX getters/setters
  function getReverbWet() { return _reverbWet; }
  function setReverbWet(v) { _reverbWet = v; }
  function getDelayWet() { return _delayWet; }
  function setDelayWet(v) { _delayWet = v; }
  function getDistortionCurve() { return _distortionCurve; }
  function setDistortionCurve(v) { _distortionCurve = v; }
  function getFilterNode() { return _filterNode; }
  function setFilterNode(v) { _filterNode = v; }

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
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function ensureReady() {
    return new Promise(resolve => {
      if (!ctx) {
        init();
      }
      if (ctx.state === 'running') {
        resolve();
        return;
      }
      if (ctx.state === 'closed') {
        // Reinitialize if closed
        ctx.close().catch(() => {});
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      ctx.resume().then(resolve).catch(resolve);
    });
  }

  return {
    init, getContext, getMasterGain, getAnalyser,
    getTrackGain, setTrackMute, isTrackMuted, resume, ensureReady,
    getReverbWet, setReverbWet,
    getDelayWet, setDelayWet,
    getDistortionCurve, setDistortionCurve,
    getFilterNode, setFilterNode
  };
})();

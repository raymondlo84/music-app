// Synthesizer - Rap-focused drum synthesis using Web Audio API
const Synthesizer = (() => {
  const ctx = AudioEngine.getContext();

  // KICK: low sine sweep with transient click
  function kick(time, options = {}) {
    const gain = options.gain || 1.0;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);

    gainNode.gain.setValueAtTime(gain, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    osc.connect(gainNode);
    gainNode.connect(AudioEngine.getMasterGain());
    osc.start(time);
    osc.stop(time + 0.4);

    // Click transient
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, time);
    osc2.frequency.exponentialRampToValueAtTime(200, time + 0.02);
    gain2.gain.setValueAtTime(gain * 0.6, time);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    osc2.connect(gain2);
    gain2.connect(AudioEngine.getMasterGain());
    osc2.start(time);
    osc2.stop(time + 0.05);
  }

  // SNARE: noise burst + tonal body
  function snare(time, options = {}) {
    const gain = options.gain || 1.0;

    // Noise component
    const bufferSize = ctx.sampleRate * 0.15;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1500;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(gain * 0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(AudioEngine.getMasterGain());
    noise.start(time);
    noise.stop(time + 0.15);

    // Tonal component
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(gain * 0.8, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(AudioEngine.getMasterGain());
    osc.start(time);
    osc.stop(time + 0.1);
  }

  // HI-HAT: filtered noise, short & bright
  function hihat(time, options = {}) {
    const gain = options.gain || 1.0;

    const bufferSize = ctx.sampleRate * 0.08;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 10000;
    bp.Q.value = 1.2;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain * 0.5, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gainNode);
    gainNode.connect(AudioEngine.getMasterGain());
    noise.start(time);
    noise.stop(time + 0.06);
  }

  // OPEN HI-HAT
  function openHat(time, options = {}) {
    const gain = options.gain || 1.0;

    const bufferSize = ctx.sampleRate * 0.3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 9000;
    bp.Q.value = 1.0;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain * 0.4, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gainNode);
    gainNode.connect(AudioEngine.getMasterGain());
    noise.start(time);
    noise.stop(time + 0.28);
  }

  // CLAP: multi-noise bursts
  function clap(time, options = {}) {
    const gain = options.gain || 1.0;

    for (let burst = 0; burst < 3; burst++) {
      const offset = time + burst * 0.01 + 0.001; // tiny offset to avoid 0-time edge case

      const bufferSize = ctx.sampleRate * 0.04;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2500;
      bp.Q.value = 1.5;

      const g = ctx.createGain();
      g.gain.setValueAtTime(gain * 0.6, offset);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.04);

      noise.connect(bp);
      bp.connect(g);
      g.connect(AudioEngine.getMasterGain());
      noise.start(offset);
      noise.stop(offset + 0.04);
    }

    // Tail
    const tailBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const tailData = tailBuffer.getChannelData(0);
    for (let i = 0; i < tailData.length; i++) {
      tailData[i] = (Math.random() * 2 - 1);
    }
    const tail = ctx.createBufferSource();
    tail.buffer = tailBuffer;
    const tailBP = ctx.createBiquadFilter();
    tailBP.type = 'bandpass';
    tailBP.frequency.value = 2500;
    tailBP.Q.value = 1.5;
    const tailG = ctx.createGain();
    tailG.gain.setValueAtTime(gain * 0.3, time + 0.03);
    tailG.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    tail.connect(tailBP);
    tailBP.connect(tailG);
    tailG.connect(AudioEngine.getMasterGain());
    tail.start(time + 0.03);
    tail.stop(time + 0.2);
  }

  // RIM: short high click
  function rim(time, options = {}) {
    const gain = options.gain || 1.0;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(400, time + 0.02);

    const g = ctx.createGain();
    g.gain.setValueAtTime(gain * 0.5, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    osc.connect(g);
    g.connect(AudioEngine.getMasterGain());
    osc.start(time);
    osc.stop(time + 0.04);
  }

  // SHAKER: short filtered noise
  function shaker(time, options = {}) {
    const gain = options.gain || 1.0;

    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 5000;
    bp.Q.value = 2.0;

    const g = ctx.createGain();
    g.gain.setValueAtTime(gain * 0.3, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(bp);
    bp.connect(g);
    g.connect(AudioEngine.getMasterGain());
    noise.start(time);
    noise.stop(time + 0.04);
  }

  // 808-STYLE BASS: sustained sine with sub (stops previous osc before starting new)
  let _bassOsc1 = null, _bassOsc2 = null, _bassGain = null;

  function bass(time, options = {}) {
    // Stop previous bass sound cleanly
    if (_bassGain) {
      try {
        _bassGain.gain.cancelScheduledValues(time);
        _bassGain.gain.setValueAtTime(_bassGain.gain.value, time);
        _bassGain.gain.linearRampToValueAtTime(0, time + 0.005);
      } catch {}
      if (_bassOsc1) { try { _bassOsc1.stop(time + 0.01); } catch {} }
      if (_bassOsc2) { try { _bassOsc2.stop(time + 0.01); } catch {} }
    }

    const note = options.note || 55; // A1 by default
    const duration = options.duration || 0.3;
    const gain = options.gain || 1.0;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, time);
    // Sub oscillator one octave down
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(note * 0.5, time);

    _bassGain = ctx.createGain();
    _bassGain.gain.setValueAtTime(0, time);
    _bassGain.gain.setValueAtTime(gain * 0.7, time + 0.01);
    _bassGain.gain.setValueAtTime(gain * 0.5, time + duration * 0.5);
    _bassGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(_bassGain);
    osc2.connect(_bassGain);
    _bassGain.connect(AudioEngine.getMasterGain());
    osc.start(time);
    osc2.start(time);
    osc.stop(time + duration);
    osc2.stop(time + duration);

    _bassOsc1 = osc;
    _bassOsc2 = osc2;
  }

  // SIDESTASH (pump effect) - ramps down gain then back up
  function sideChain(time, duration) {
    const mg = AudioEngine.getMasterGain();
    if (!mg) return;
    mg.gain.setValueAtTime(mg.gain.value, time);
    mg.gain.exponentialRampToValueAtTime(mg.gain.value * 0.3, time + duration * 0.15);
    mg.gain.exponentialRampToValueAtTime(mg.gain.value, time + duration * 0.5);
  }

  return {
    kick, snare, hihat, openHat, clap, rim, shaker, bass, sideChain
  };
})();

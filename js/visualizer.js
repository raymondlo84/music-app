/**
 * Visualizer Module
 * Draws frequency bars on #visualizer canvas using analyser data.
 */
const Visualizer = (() => {
  let animInterval = null;
  let canvas = null;
  let ctx = null;
  let analyser = null;
  let dataArray = null;
  let barCount = 64;
  let stepSize = 1;

  function resizeCanvas() {
    if (!canvas || !canvas.parentElement) return;
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function draw() {
    resizeCanvas();

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray);
    }

    const barWidth = (canvas.width / barCount) - 1;
    let x = 0;

    for (let i = 0; i < barCount; i++) {
      let barHeight = 0;
      if (analyser && dataArray) {
        const idx = Math.min(Math.floor(i * stepSize), dataArray.length - 1);
        barHeight = (dataArray[idx] / 255) * (canvas.height - 4);
      } else {
        // Fallback: draw placeholder bars when audio is suspended
        barHeight = (Math.sin(i * 0.8 + Date.now() / 500) * 0.5 + 0.5) * (canvas.height * 0.4) + 4;
      }

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
      gradient.addColorStop(0, '#00aa55');
      gradient.addColorStop(1, '#00ff88');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      // Glow reflection
      ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
      ctx.fillRect(x, canvas.height - barHeight - 4, barWidth, 2);

      x += barWidth + 1;
    }
  }

  function start() {
    canvas = document.getElementById('visualizer');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    analyser = AudioEngine.getAnalyser();
    if (!analyser) return;

    stepSize = analyser.frequencyBinCount / barCount;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Resize immediately
    resizeCanvas();

    // Use setInterval for reliable animation
    animInterval = setInterval(draw, 50);
    draw();

    window.addEventListener('resize', resizeCanvas);
  }

  function stop() {
    if (animInterval) {
      clearInterval(animInterval);
      animInterval = null;
    }
    window.removeEventListener('resize', resizeCanvas);
  }

  return { start, stop };
})();

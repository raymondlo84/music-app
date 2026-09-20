/**
 * Visualizer Module
 * Draws frequency bars on #visualizer canvas using analyser data.
 */
const Visualizer = (() => {
  let animId = null;
  let canvas = null;
  let ctx = null;
  let analyser = null;
  let dataArray = null;
  let barCount = 64;
  let stepSize = 1;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 900;
    canvas.height = canvas.offsetHeight || 100;
  }

  function draw() {
    animId = requestAnimationFrame(draw);
    resizeCanvas();

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(dataArray);

    const barWidth = (canvas.width / barCount) - 1;
    let x = 0;

    for (let i = 0; i < barCount; i++) {
      const idx = Math.floor(i * stepSize);
      const barHeight = (dataArray[idx] / 255) * (canvas.height - 4);

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

    // Resize immediately AND on next rAF
    resizeCanvas();
    requestAnimationFrame(() => {
      resizeCanvas();
      draw();
    });

    window.addEventListener('resize', resizeCanvas);
  }

  // Auto-resize canvas on DOMContentLoaded as fallback (for cached/served pages)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const c = document.getElementById('visualizer');
      if (c) {
        c.width = c.offsetWidth;
        c.height = c.offsetHeight;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, c.width, c.height);
      }
    });
  }

  function stop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    window.removeEventListener('resize', resizeCanvas);
  }

  return { start, stop };
})();

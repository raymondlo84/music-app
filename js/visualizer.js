/**
 * Visualizer Module
 * Draws frequency bars on #visualizer canvas using analyser data.
 */
const Visualizer = (() => {
  let animId = null;
  let canvas = null;
  let ctx = null;
  let analyser = null;

  function start() {
    canvas = document.getElementById('visualizer');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    analyser = AudioEngine.getAnalyser();
    if (!analyser) return;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 64;
    const stepSize = bufferLength / barCount;

    function draw() {
      animId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      resizeCanvas();
      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    draw();
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 900;
    canvas.height = canvas.offsetHeight || 100;
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

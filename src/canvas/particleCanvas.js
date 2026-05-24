const COLORS = [
  '81, 162, 233',
  '81, 162, 233',
  '81, 162, 233',
  '50, 255, 4',
];

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

function getSettings(mode, width) {
  if (mode === 'background') {
    if (width > 1600) return { count: 90, linkDistance: 0, linkRadius: 0 };
    if (width > 1300) return { count: 70, linkDistance: 0, linkRadius: 0 };
    if (width > 1100) return { count: 50, linkDistance: 0, linkRadius: 0 };
    return { count: 0, linkDistance: 0, linkRadius: 0 };
  }

  if (width > 1600) return { count: 260, linkDistance: 70, linkRadius: 300 };
  if (width > 1300) return { count: 230, linkDistance: 60, linkRadius: 280 };
  if (width > 1100) return { count: 190, linkDistance: 55, linkRadius: 250 };
  if (width > 800) return { count: 90, linkDistance: 0, linkRadius: 0 };
  if (width > 600) return { count: 60, linkDistance: 0, linkRadius: 0 };
  return { count: 35, linkDistance: 0, linkRadius: 0 };
}

export default function createParticleCanvas(selector, mode = 'hero') {
  const canvas = document.querySelector(selector);
  const context = canvas?.getContext('2d');

  if (!canvas || !context || reducedMotionQuery.matches) {
    if (canvas) canvas.style.display = 'none';
    return () => {};
  }

  let animationFrameId = 0;
  let resizeTimeoutId = 0;
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let mousePosition = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  function syncCanvasSize() {
    const ratio = getPixelRatio();
    const bounds = canvas.parentElement?.getBoundingClientRect() || {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    canvasWidth = bounds.width;
    canvasHeight = bounds.height;
    canvas.width = Math.floor(canvasWidth * ratio);
    canvas.height = Math.floor(canvasHeight * ratio);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 0.3;
  }

  function createParticle() {
    return {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: -0.45 + Math.random() * 0.9,
      vy: -0.45 + Math.random() * 0.9,
      radius: Math.max(Math.random() * 1.5, 0.4),
      color: randomColor(),
    };
  }

  function createCursorParticle() {
    return {
      x: mousePosition.x,
      y: mousePosition.y,
      vx: 0,
      vy: 0,
      radius: 1.8,
      color: '81, 162, 233',
      isCursor: true,
    };
  }

  function resetParticles() {
    const { count } = getSettings(mode, window.innerWidth);
    const generatedParticles = Array.from({ length: count }, createParticle);
    particles =
      mode === 'hero'
        ? [createCursorParticle(), ...generatedParticles]
        : generatedParticles;
  }

  function moveParticle(particle) {
    if (particle.isCursor) {
      particle.x = mousePosition.x;
      particle.y = mousePosition.y;
      return;
    }

    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > canvasWidth) particle.vx *= -1;
    if (particle.y < 0 || particle.y > canvasHeight) particle.vy *= -1;
  }

  function drawParticle(particle) {
    const distance = Math.hypot(
      particle.x - mousePosition.x,
      particle.y - mousePosition.y
    );
    const opacity = Math.max(0.15, 1 - distance / (window.innerWidth / 1.8));

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${particle.color}, ${opacity})`;
    context.fill();
  }

  function drawConnections(settings) {
    if (!settings.linkDistance || !settings.linkRadius) return;

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const first = particles[i];
        const second = particles[j];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        const mouseDistance = Math.hypot(
          first.x - mousePosition.x,
          first.y - mousePosition.y
        );

        if (
          distance <= settings.linkDistance &&
          mouseDistance <= settings.linkRadius
        ) {
          const opacity = Math.max(0, 1 - mouseDistance / settings.linkRadius);

          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.strokeStyle = `rgba(50, 255, 4, ${opacity})`;
          context.stroke();
        }
      }
    }
  }

  function render() {
    const settings = getSettings(mode, window.innerWidth);

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    particles.forEach((particle) => {
      moveParticle(particle);
      drawParticle(particle);
    });
    drawConnections(settings);

    animationFrameId = window.requestAnimationFrame(render);
  }

  function handlePointerMove(event) {
    mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };

    const cursorParticle = particles[0];
    if (cursorParticle?.isCursor) {
      cursorParticle.x = mousePosition.x;
      cursorParticle.y = mousePosition.y;
    }
  }

  function handleScroll() {
    if (mode !== 'background') return;

    mousePosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
  }

  function handleResize() {
    window.clearTimeout(resizeTimeoutId);
    resizeTimeoutId = window.setTimeout(() => {
      syncCanvasSize();
      resetParticles();
    }, 150);
  }

  syncCanvasSize();
  resetParticles();
  render();

  if (mode === 'hero') {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize);

  return () => {
    window.cancelAnimationFrame(animationFrameId);
    window.clearTimeout(resizeTimeoutId);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
  };
}

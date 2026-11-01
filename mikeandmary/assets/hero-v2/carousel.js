(() => {
  'use strict';
  const hero = document.getElementById('dream-carousel');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.mm-slide')];
  const thumbs = [...hero.querySelectorAll('.mm-thumb')];
  const names = [
    ['Santorini, Greece', 'Wake up somewhere extraordinary.'],
    ['Lake Tahoe, California', 'Trade a crowded calendar for mountain mornings.'],
    ['The Amalfi Coast, Italy', 'A view worth designing your life around.'],
    ['Your Riverside Retreat', 'More days spent where you want to be.'],
    ['Positano, Italy', 'Make room for moments that matter.'],
    ['An Alpine Escape', 'Freedom is having the choice.']
  ];
  const get = id => hero.querySelector('#mm-' + id);
  const progress = get('progress');
  const pause = get('pause');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 6500;
  let current = 0;
  let paused = reducedMotion.matches;
  let hovering = false;
  let focused = false;
  let visible = true;
  let elapsed = 0;
  let lastTime = null;
  let frame = null;

  const mayPlay = () => !paused && !hovering && !focused && !document.hidden && visible;
  function syncPlayback() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    hero.dataset.autoplay = mayPlay() ? 'playing' : 'paused';
    pause.textContent = paused ? '▶' : '❚❚';
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Resume automatic slideshow' : 'Pause automatic slideshow');
    pause.title = paused ? 'Resume slideshow' : 'Pause slideshow';
    if (mayPlay()) frame = requestAnimationFrame(tick);
  }
  function goTo(index, announce = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('mm-active', i === current));
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('mm-active', i === current);
      thumb.setAttribute('aria-current', String(i === current));
    });
    const number = String(current + 1).padStart(2, '0');
    get('destination-eyebrow').textContent = 'DREAM DESTINATION ' + number;
    get('destination-name').textContent = names[current][0];
    get('destination-message').textContent = names[current][1];
    get('counter').textContent = number + ' / ' + String(slides.length).padStart(2, '0');
    if (announce) get('announcement').textContent = `${names[current][0]}, destination ${current + 1} of ${slides.length}.`;
    elapsed = 0;
    lastTime = null;
    progress.style.transform = 'scaleX(0)';
  }
  function tick(now) {
    frame = null;
    if (!mayPlay()) return;
    if (lastTime !== null) elapsed += now - lastTime;
    lastTime = now;
    if (elapsed >= interval) goTo(current + 1);
    progress.style.transform = `scaleX(${Math.min(elapsed / interval, 1)})`;
    frame = requestAnimationFrame(tick);
  }
  thumbs.forEach(thumb => thumb.addEventListener('click', () => goTo(Number(thumb.dataset.index), true)));
  get('prev').addEventListener('click', () => goTo(current - 1, true));
  get('next').addEventListener('click', () => goTo(current + 1, true));
  pause.addEventListener('click', () => { paused = !paused; syncPlayback(); });
  hero.addEventListener('keydown', event => {
    if (event.target.closest('a') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(current + (event.key === 'ArrowRight' ? 1 : -1), true);
    }
  });
  hero.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovering = true; syncPlayback(); }
  });
  hero.addEventListener('pointerleave', () => { hovering = false; syncPlayback(); });
  hero.addEventListener('focusin', () => { focused = true; syncPlayback(); });
  hero.addEventListener('focusout', event => {
    if (!hero.contains(event.relatedTarget)) { focused = false; syncPlayback(); }
  });
  // A horizontal touch swipe changes scenes without preventing vertical page scrolling.
  let touchStart = null;
  hero.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  hero.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1), true);
    touchStart = null;
  }, { passive: true });
  hero.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; syncPlayback(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncPlayback(); }).observe(hero);
  }
  syncPlayback();
})();

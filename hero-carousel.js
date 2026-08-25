(() => {
  const hero = document.querySelector('[data-lifestyle-carousel]');
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll('.lifestyle-hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.lifestyle-dot'));
  const previous = hero.querySelector('[data-carousel-previous]');
  const next = hero.querySelector('[data-carousel-next]');
  const label = hero.querySelector('[data-carousel-label]');
  const title = hero.querySelector('[data-carousel-title]');
  const count = hero.querySelector('[data-carousel-count]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  let timer = null;
  let touchStartX = null;

  const render = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === current;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === current;
      dot.classList.toggle('active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    const activeSlide = slides[current];
    label.textContent = activeSlide.dataset.label || '';
    title.textContent = activeSlide.dataset.title || '';
    count.innerHTML = `<strong>${String(current + 1).padStart(2, '0')}</strong> / ${String(slides.length).padStart(2, '0')}`;
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (!reducedMotion && !document.hidden) {
      timer = window.setInterval(() => render(current + 1), 6500);
    }
  };

  previous?.addEventListener('click', () => {
    render(current - 1);
    start();
  });

  next?.addEventListener('click', () => {
    render(current + 1);
    start();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      render(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', start);

  hero.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      render(current - 1);
      start();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      render(current + 1);
      start();
    }
  });

  hero.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX ?? null;
  }, { passive: true });

  hero.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const distance = touchEndX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 45) return;
    render(current + (distance < 0 ? 1 : -1));
    start();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  render(0);
  start();
})();

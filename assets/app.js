(() => {
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.destination-slide'));
    const dots = Array.from(carousel.querySelectorAll('.carousel-dots button'));
    const previous = carousel.querySelector('[data-previous]');
    const next = carousel.querySelector('[data-next]');
    const count = carousel.querySelector('[data-count]');
    const kicker = carousel.querySelector('.slide-caption [data-kicker]');
    const title = carousel.querySelector('.slide-caption [data-title]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active = 0;
    let timer = null;
    let touchStartX = null;

    const render = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const selected = slideIndex === active;
        slide.classList.toggle('active', selected);
        slide.setAttribute('aria-hidden', String(!selected));
      });
      dots.forEach((dot, dotIndex) => {
        const selected = dotIndex === active;
        dot.classList.toggle('active', selected);
        if (selected) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      const slide = slides[active];
      count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      kicker.textContent = slide.dataset.kicker || '';
      title.textContent = slide.dataset.title || '';
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (!reducedMotion && !document.hidden) timer = window.setInterval(() => render(active + 1), 6500);
    };

    previous.addEventListener('click', () => { render(active - 1); start(); });
    next.addEventListener('click', () => { render(active + 1); start(); });
    dots.forEach((dot, index) => dot.addEventListener('click', () => { render(index); start(); }));
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); render(active - 1); start(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); render(active + 1); start(); }
    });
    carousel.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0]?.clientX ?? null; }, { passive: true });
    carousel.addEventListener('touchend', (event) => {
      if (touchStartX === null) return;
      const distance = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) < 45) return;
      render(active + (distance < 0 ? 1 : -1));
      start();
    }, { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    render(0);
    start();
  }

  const regretButtons = Array.from(document.querySelectorAll('[data-regret-questions] button'));
  const regretCount = document.querySelector('[data-regret-count]');
  const regretProgress = document.querySelector('[data-regret-progress]');

  const updateRegretScore = () => {
    const selected = regretButtons.filter((button) => button.getAttribute('aria-pressed') === 'true').length;
    regretCount.textContent = String(selected);
    regretProgress.style.width = `${selected * 20}%`;
  };

  regretButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', String(!selected));
      updateRegretScore();
    });
  });
  updateRegretScore();
})();


(() => {
  const rail = document.querySelector('.assets-scroll-rail');
  if (!rail) return;

  const targets = ['top', 'idea', 'dividend', 'truth', 'retreat', 'legacy', 'test', 'next-step'];
  const dots = Array.from(rail.querySelectorAll('[data-assets-target]'));
  const upButton = rail.querySelector('[data-assets-scroll="up"]');
  const downButton = rail.querySelector('[data-assets-scroll="down"]');

  const setActive = (target) => {
    dots.forEach((dot) => {
      const active = dot.dataset.assetsTarget === target;
      dot.classList.toggle('active', active);
      if (active) dot.setAttribute('aria-current', 'page');
      else dot.removeAttribute('aria-current');
    });
  };

  const updateRail = () => {
    const readingLine = window.scrollY + window.innerHeight * 0.38;
    let active = 'top';
    targets.slice(1).forEach((target) => {
      const section = document.getElementById(target);
      if (section && section.offsetTop <= readingLine) active = target;
    });
    setActive(active);

    const bottom = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 4;
    if (upButton) upButton.disabled = window.scrollY <= 4;
    if (downButton) downButton.disabled = bottom;
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = dot.dataset.assetsTarget;
      if (target === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  upButton?.addEventListener('click', () => window.scrollBy({ top: -Math.round(window.innerHeight * 0.78), behavior: 'smooth' }));
  downButton?.addEventListener('click', () => window.scrollBy({ top: Math.round(window.innerHeight * 0.78), behavior: 'smooth' }));
  window.addEventListener('scroll', updateRail, { passive: true });
  window.addEventListener('resize', updateRail);
  updateRail();
})();

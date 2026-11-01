(() => {
  'use strict';
  const nav = document.getElementById('page-nav');
  const frame = document.querySelector('.site-frame');
  if (!nav || !frame) return;
  const stops = document.getElementById('page-nav-stops');
  const links = [...stops.querySelectorAll('a')];
  const up = nav.querySelector('[data-page-scroll="up"]');
  const down = nav.querySelector('[data-page-scroll="down"]');
  const toggle = nav.querySelector('.page-nav-toggle');
  const header = document.querySelector('.site-header');
  const compact = window.matchMedia('(max-width: 1100px), (max-height: 560px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let points = [];
  let pending = false;

  const maximumScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  function scrollToPosition(top) {
    window.scrollTo({ top: Math.max(0, Math.min(maximumScroll(), top)), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  function move(direction) {
    const usableHeight = window.innerHeight - header.getBoundingClientRect().height - (compact.matches ? nav.offsetHeight : 0);
    scrollToPosition(window.scrollY + direction * Math.max(160, usableHeight * 0.85));
  }
  function setExpanded(expanded, restoreFocus = false) {
    stops.hidden = compact.matches && !expanded;
    toggle.setAttribute('aria-expanded', String(!stops.hidden));
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }
  function syncProgress() {
    pending = false;
    const y = window.scrollY;
    const maximum = maximumScroll();
    up.disabled = y <= 2;
    down.disabled = y >= maximum - 2;
    // Keep the current section active until the following section is reached.
    let current = 0;
    points.forEach((point, index) => { if (y + 8 >= point) current = index; });
    if (y >= maximum - 2) current = links.length - 1;
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleProgress() {
    if (!pending) { pending = true; requestAnimationFrame(syncProgress); }
  }
  function measure() {
    const offset = header.getBoundingClientRect().height + 18;
    const maximum = maximumScroll();
    points = links.map(link => {
      if (link.hash === '#home') return 0;
      if (link.hash === '#page-footer') return maximum;
      const target = document.getElementById(link.hash.slice(1));
      return Math.max(0, Math.min(maximum, target.getBoundingClientRect().top + window.scrollY - offset));
    });
    syncProgress();
  }
  up.addEventListener('click', () => move(-1));
  down.addEventListener('click', () => move(1));
  toggle.addEventListener('click', () => setExpanded(stops.hidden));
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    measure();
    history.replaceState(history.state, '', link.href);
    scrollToPosition(points[index]);
    if (compact.matches) setExpanded(false, true);
  }));
  nav.addEventListener('keydown', event => {
    const actions = { Home: () => scrollToPosition(0), End: () => scrollToPosition(maximumScroll()), ArrowUp: () => move(-1), ArrowDown: () => move(1) };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && compact.matches && !stops.hidden) setExpanded(false, true);
  });
  document.addEventListener('click', event => {
    if (compact.matches && !stops.hidden && !nav.contains(event.target)) setExpanded(false);
  });
  compact.addEventListener('change', () => {
    const focusWasToggle = document.activeElement === toggle;
    const focusWouldHide = compact.matches && stops.contains(document.activeElement);
    setExpanded(!compact.matches, focusWouldHide);
    measure();
    if (!compact.matches && focusWasToggle) (links.find(link => link.hasAttribute('aria-current')) || links[0]).focus({ preventScroll: true });
  });
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(frame);
  if (document.fonts?.ready) document.fonts.ready.then(measure);
  nav.hidden = false;
  setExpanded(!compact.matches);
  measure();
})();

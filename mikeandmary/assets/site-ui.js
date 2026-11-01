(() => {
  'use strict';
  const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
  const sections = ['calculator', 'compare', 'lifestyle', 'ecosystem'].map(id => document.getElementById(id));
  let scheduled = false;
  function updateNav() {
    scheduled = false;
    const cutoff = document.querySelector('.site-header').getBoundingClientRect().height + 145;
    const active = sections.filter(section => section.getBoundingClientRect().top <= cutoff).at(-1);
    navLinks.forEach(link => {
      if (active && link.getAttribute('href') === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleNav() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNav); }
  }
  document.addEventListener('scroll', scheduleNav, { passive: true });
  window.addEventListener('resize', scheduleNav);
  updateNav();
  const menu = document.getElementById('mobileNav');
  const menuButton = document.getElementById('menuToggle');
  function closeMenu(restoreFocus = false) {
    if (menu.hidden) return;
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    menuButton.textContent = '☰';
    if (restoreFocus) menuButton.focus();
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 921px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  const viewer = document.getElementById('imageViewer');
  const viewerImage = document.getElementById('viewerImage');
  const zoomButton = document.getElementById('zoomViewer');
  document.querySelectorAll('[data-image-viewer]').forEach(link => {
    link.addEventListener('click', event => {
      if (!viewer.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const image = link.querySelector('img');
      viewerImage.src = link.href;
      viewerImage.alt = image.alt;
      document.getElementById('viewerCaption').textContent = image.alt;
      viewer.classList.remove('is-zoomed');
      zoomButton.textContent = 'Zoom in';
      zoomButton.setAttribute('aria-pressed', 'false');
      viewer.showModal();
    });
  });
  document.getElementById('closeViewer').addEventListener('click', () => viewer.close());
  zoomButton.addEventListener('click', () => {
    const zoomed = viewer.classList.toggle('is-zoomed');
    zoomButton.textContent = zoomed ? 'Fit image' : 'Zoom in';
    zoomButton.setAttribute('aria-pressed', String(zoomed));
  });
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
})();

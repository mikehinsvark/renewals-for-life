/* Rep context is public attribution only; income values remain in browser storage. */
(() => {
  'use strict';
  const route = window.location.pathname.match(/^\/(AA\d{4})\/?$/i);
  const query = new URLSearchParams(window.location.search);
  const candidate = (query.get('refid') || '').trim().toUpperCase();
  const sharedCode = /^\d{4}$/.test(candidate) ? 'AA' + candidate : candidate;
  const code = route ? route[1].toUpperCase() : (/^AA\d{4}$/.test(sharedCode) ? sharedCode : 'AA0233');
  document.documentElement.dataset.repCode = code;
  document.querySelectorAll('span[data-rep-code]').forEach(node => { node.textContent = code; });

  // GitHub Pages resolves uncatalogued rep paths via 404.html to this shared page.
  // Replace the neutral template URL with the visitor's public rep address.
  if (/^\/dbr(?:\/|\/index\.html)?$/.test(window.location.pathname) || route) {
    query.delete('refid');
    const search = query.toString();
    const publicPath = '/' + code + '/' + (search ? '?' + search : '') + window.location.hash;
    if (window.location.pathname + window.location.search + window.location.hash !== publicPath) {
      window.history.replaceState(null, '', publicPath);
    }
  }
  const shareURL = window.location.origin + '/' + code + '/';
  document.querySelector('link[rel="canonical"]').href = 'https://renewalsforlifestyle.com/AA0233/';
  document.querySelector('meta[property="og:url"]').content = 'https://renewalsforlifestyle.com/' + code + '/';
  document.querySelectorAll('a[data-rep-link]').forEach(link => {
    const target = new URL(link.href);
    target.searchParams.set('refid', code);
    link.href = target.toString();
  });
  const copy = document.getElementById('copyPageLink');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      copy.textContent = '✓ Link copied';
      document.getElementById('toast').textContent = 'Your DREAMS page link is copied. Calculator amounts are not included.';
      document.getElementById('toast').classList.add('show');
      setTimeout(() => { copy.textContent = '↗ Copy page link'; document.getElementById('toast').classList.remove('show'); }, 3200);
    } catch (_) {
      window.prompt('Copy your DREAMS page link:', shareURL);
    }
  });
})();

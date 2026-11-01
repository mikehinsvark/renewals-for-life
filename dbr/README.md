# DREAMS Income & Lifestyle Builder

The independent DREAMS-branded version lives at `/AA0233/`. The original
`/mikeandmary/` is unchanged. All assets are local to `/dbr/assets/`.

## Replication

The Products Portfolio uses `data-agent-referral="path"` to replace the default
`/AA0233` with its saved `AA` + four-digit representative code. Any valid code is
accepted as attribution; this is not representative authentication or validation
against an agent roster.

GitHub Pages serves AA0233 directly. Other `AA0000`–`AA9999` paths use the scoped
root `404.html` redirect to the HTTP-200 shared `/dbr/?refid=CODE` template. The
template restores the public `/CODE/` address with `history.replaceState`.
Refreshing a replicated address repeats this fallback. Other missing paths keep
a genuine not-found page. Assets use absolute paths, so deep links work with or
without a trailing slash. All copies canonicalize to AA0233 to avoid indexing
duplicate calculators.

The referral initializer runs before the calculator. Values use a separate
`dreams-dbr-income-v1-CODE` browser-storage key for each rep, never the original
personal page's storage. Sharing copies only the URL, never entered amounts.
The product-hub return link carries `refid`; the hub honors a valid URL code
before a locally saved code, without overwriting the saved preference.

## Updating the page

Edit `dbr/index.html`, then copy it to `AA0233/index.html`. Keep the two HTML
files identical. Shared styles, scripts and images need only one edit.

The supplied three-brand artwork is displayed through a CSS viewport showing
the left DREAMS Business Resources logo. Its original bitmap is unchanged.

Before release: verify both pages, 7 recurring and 7 one-time defaults, mobile
overflow, arithmetic, storage isolation, link copying, and at least two rep
codes through the hub's Save/Clear ID flow. Also check invalid paths stay 404.

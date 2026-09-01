/** Resolves page links relative to /pages/ or root depending on current location */
export const PAGE_HREF = (p) =>
  `${location.pathname.includes('/pages/') ? '' : 'pages/'}${p}`;

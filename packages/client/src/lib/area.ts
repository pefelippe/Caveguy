/**
 * The app lives under `/app`, the site (landing, sign-in, legal and public pages) at the root.
 * Each is its own router (`basename` in `main.tsx`), so the app's links stay `/caishen/...`;
 * going from one to the other is a full page load.
 */
export const APP_BASE = '/app';

export const IN_APP = new RegExp(`^${APP_BASE}(/|$)`).test(window.location.pathname);

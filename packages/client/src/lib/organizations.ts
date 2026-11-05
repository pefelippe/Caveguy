import { useEffect } from 'react';

import { APP_BASE } from './area';
import { authClient } from './auth';

/*
 * Switching Organizations (docs/adr/0038). Every screen, query and cache belongs to the active one,
 * so a switch reloads the app from its home, here and in every other tab of this browser: they
 * share the session cookie, and a tab left on the old Organization would write into the new one.
 */

const CHANNEL = 'caveguy:organization';

/** Reloads the app on its home in this tab and tells the other tabs to do the same. */
export function reloadOrganization() {
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage('changed');
    channel.close();
  }
  window.location.assign(APP_BASE);
}

/** Makes `organizationId` the active Organization, then reloads. Returns the error's code, if any. */
export async function switchOrganization(organizationId: string): Promise<string | undefined> {
  const result = await authClient.organization.setActive({ organizationId });
  if (result.error) return result.error.code ?? 'FAILED';
  reloadOrganization();
}

/** Reloads this tab when another one switches, accepts an invitation or leaves an Organization. */
export function useOrganizationReload() {
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = () => window.location.assign(APP_BASE);
    return () => channel.close();
  }, []);
}

/*
 * Where to go once signed in: an app address opened signed out (an invitation's link) is kept for
 * this tab and opened after the sign-in, the sign-up or Google's return.
 */

const NEXT = 'caveguy:next';

/** Keeps `path` (inside the app) to open after signing in. Only plain relative paths. */
export function rememberNext(path: string) {
  if (/^\/(?!\/)/.test(path) && path !== '/') sessionStorage.setItem(NEXT, path);
}

/** The path kept by `rememberNext`, if any. */
export const pendingNext = () => sessionStorage.getItem(NEXT);

export const forgetNext = () => sessionStorage.removeItem(NEXT);

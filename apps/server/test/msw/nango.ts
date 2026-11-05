import { http, HttpResponse, type HttpHandler } from 'msw';

const API = 'https://api.nango.dev';

/**
 * Fakes Nango: Connect sessions, the connection list filtered by end user as Nango does, deleting
 * one, and the proxy to Google Agenda's events. `unfiltered` returns everyone's connections, as
 * if Nango ignored the end user. `link(userId)` stands in for the User finishing
 * Nango's Connect window; `sessions` records each session body sent.
 */
export function nangoHandlers(
  events: unknown[] = [],
  state: { revoked?: boolean; unfiltered?: boolean } = {}
) {
  const connections = new Map<string, string>(); // connection id → end user id
  const sessions: Record<string, unknown>[] = [];
  const proxied: { connectionId: string | null; url: string }[] = [];
  const handlers: HttpHandler[] = [
    http.post(`${API}/connect/sessions`, async ({ request }) => {
      sessions.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({
        data: { connect_link: 'https://connect.nango.dev', expires_at: '', token: 'session-1' },
      });
    }),
    http.get(`${API}/connections`, ({ request }) => {
      const user = new URL(request.url).searchParams.get('endUserId');
      return HttpResponse.json({
        connections: [...connections]
          .filter(([, owner]) => state.unfiltered || owner === user)
          .map(([id, owner]) => ({
            connection_id: id,
            end_user: { id: owner },
            provider_config_key: 'google-calendar',
          })),
      });
    }),
    http.delete(`${API}/connections/:id`, ({ params }) => {
      connections.delete(params.id as string);
      return new HttpResponse(null, { status: 204 });
    }),
    http.get(`${API}/proxy/calendar/v3/calendars/primary/events`, ({ request }) => {
      proxied.push({ connectionId: request.headers.get('Connection-Id'), url: request.url });
      if (state.revoked) return HttpResponse.json({ error: 'invalid_grant' }, { status: 401 });
      return HttpResponse.json({ items: events });
    }),
  ];
  const link = (userId: string, id = `conn-${userId}`) => connections.set(id, userId);
  return { handlers, link, proxied, sessions };
}

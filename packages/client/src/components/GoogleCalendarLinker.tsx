import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import Nango from '@nangohq/frontend';
import {
  ConnectionsDocument,
  GoogleCalendarEventsDocument,
  StartGoogleCalendarLinkDocument,
  UnlinkGoogleCalendarDocument,
} from '@zapbots/graphql/client';
import { useState } from 'react';

import { Button } from '@zapbots/ui/components/button';

import { FormError } from './FormError';

const when = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  weekday: 'short',
});
const day = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
  weekday: 'short',
});

/**
 * Google Agenda through Nango (docs/adr/0034): Conectar opens Nango's Connect window with a token
 * from the server; once linked, the next events read live, and the way out.
 */
export function GoogleCalendarLinker({ connected }: { connected: boolean }) {
  const client = useApolloClient();
  const [start, starting] = useMutation(StartGoogleCalendarLinkDocument);
  const [unlink, unlinking] = useMutation(UnlinkGoogleCalendarDocument, {
    refetchQueries: [ConnectionsDocument],
  });
  const events = useQuery(GoogleCalendarEventsDocument, { skip: !connected });
  const [failed, setFailed] = useState<string | null>(null);

  const connect = async () => {
    setFailed(null);
    const result = await start().catch(() => null);
    if (!result?.data) return;
    new Nango().openConnectUI({
      lang: 'pt',
      onEvent: event => {
        if (event.type === 'connect')
          void client.refetchQueries({ include: [ConnectionsDocument] });
        if (event.type === 'error') setFailed('O Google não concluiu a conexão. Tente de novo.');
      },
      sessionToken: result.data.startGoogleCalendarLink,
    });
  };

  if (connected) {
    const list = events.data?.googleCalendarEvents ?? [];
    return (
      <div className="flex flex-col gap-3">
        {events.loading ? (
          <p className="text-sm text-muted-foreground">Lendo sua agenda…</p>
        ) : events.error ? (
          <FormError error={events.error} />
        ) : list.length ? (
          <ul className="flex flex-col gap-1.5 text-sm">
            {list.map(event => (
              <li className="flex gap-3" key={`${event.start}-${event.title}`}>
                <span className="w-32 shrink-0 text-muted-foreground tabular-nums">
                  {(event.allDay ? day : when).format(new Date(event.start))}
                </span>
                <span className="min-w-0 truncate">{event.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nada marcado daqui para frente.</p>
        )}
        <Button
          className="self-start"
          disabled={unlinking.loading}
          onClick={() => void unlink()}
          size="sm"
          variant="outline"
        >
          Desconectar
        </Button>
        {unlinking.error && <FormError error={unlinking.error} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {failed && (
        <p className="rounded-xl bg-secondary/60 px-4 py-3.5 text-muted-foreground">{failed}</p>
      )}
      <Button
        className="self-start"
        disabled={starting.loading}
        onClick={() => void connect()}
        size="sm"
      >
        Conectar
      </Button>
      {starting.error && <FormError error={starting.error} />}
    </div>
  );
}

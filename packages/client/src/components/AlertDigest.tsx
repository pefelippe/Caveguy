import {
  BellIcon,
  CalendarClockIcon,
  CircleAlertIcon,
  CreditCardIcon,
  GaugeIcon,
  RefreshCwOffIcon,
  TrendingUpIcon,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@zapbots/ui/lib/utils';

/** Each Aviso's mark and tone, told by its wording (the server writes them, `alerts.ts`). */
const KINDS: { icon: LucideIcon; test: RegExp; tone: string }[] = [
  { icon: CircleAlertIcon, test: /em atraso/, tone: 'bg-destructive/10 text-destructive' },
  { icon: CalendarClockIcon, test: /vence em/, tone: 'bg-seal/10 text-seal' },
  { icon: GaugeIcon, test: /limite do mês/, tone: 'bg-warning/15 text-warning' },
  { icon: CreditCardIcon, test: /do limite|fatura/i, tone: 'bg-warning/15 text-warning' },
  { icon: TrendingUpIcon, test: /acima da média/, tone: 'bg-warning/15 text-warning' },
  { icon: RefreshCwOffIcon, test: /Rotina/, tone: 'bg-muted text-muted-foreground' },
];

const MONEY_AT_END = /^(.*?):\s*(R\$\s?[\d.]*\d,\d{2})\.?$/;

/** "15/11/2026" as "15/11" in the current year. */
const shortDates = (text: string) =>
  text.replace(new RegExp(`(\\d{2}/\\d{2})/${new Date().getFullYear()}`, 'g'), '$1');

/**
 * The Agente's daily Avisos Message (`deliverAlerts`) drawn as cards: the greeting, one row per
 * Aviso with its mark and its amount on the right, and the closing line. Its text stays plain in
 * the database, so the Model reads it as it is.
 */
export function AlertDigest({ text }: { text: string }) {
  const lines = text.split('\n').filter(line => line.trim());
  const items = lines.filter(line => line.startsWith('- ')).map(line => line.slice(2));
  const greeting = lines.find(line => !line.startsWith('- '));
  const closing = lines.length > 1 ? lines.at(-1) : undefined;

  return (
    <div className="flex flex-col gap-3">
      {greeting && <p className="font-medium">{greeting}</p>}
      <ul className="flex flex-col gap-2">
        {items.map(item => {
          const kind = KINDS.find(candidate => candidate.test.test(item));
          const Icon = kind?.icon ?? BellIcon;
          const [, what, amount] = item.match(MONEY_AT_END) ?? [null, item, null];
          return (
            <li className="flex items-center gap-3 rounded-xl border bg-card p-3" key={item}>
              <span
                className={cn(
                  'grid size-9 shrink-0 place-items-center rounded-lg',
                  kind?.tone ?? 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1 text-sm">{shortDates(what!)}</span>
              {amount && <span className="shrink-0 font-semibold tabular-nums">{amount}</span>}
            </li>
          );
        })}
      </ul>
      {closing && closing !== greeting && !closing.startsWith('- ') && (
        <p className="text-sm text-muted-foreground">{closing}</p>
      )}
    </div>
  );
}

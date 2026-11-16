import { useQuery } from '@apollo/client/react';
import { ConnectionsDocument, type MoneyHomeQuery } from '@zapbots/graphql/client';
import { CheckIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';
import { Card } from '@zapbots/ui/components/card';
import { cn } from '@zapbots/ui/lib/utils';

type Holder = MoneyHomeQuery['viewerHolder'];

interface Step {
  action: string;
  detail: string;
  done: boolean;
  title: string;
  to: string;
}

/**
 * Primeiros passos, the Nylas console's stepper (docs/design-guide.md): what the Caveguy still
 * needs to see the whole month. Each step is done by what the User already has; the card leaves
 * once all are done. Open Finance and WhatsApp show only where the server offers them.
 */
export function FirstSteps({
  holder,
  links,
}: {
  holder: Holder;
  links: MoneyHomeQuery['bankLinks'];
}) {
  const { data } = useQuery(ConnectionsDocument);
  if (!data) return null;
  const connection = (kind: string) => data.connections.find(item => item.kind === kind);
  const bank = connection('OPEN_FINANCE');
  const whatsapp = connection('WHATSAPP');

  const steps: Step[] = [
    ...(bank?.available
      ? [
          {
            action: 'Conectar banco',
            detail: 'Pelo Open Finance. Só leitura: nada sai da sua conta.',
            done: bank.connected || links.length > 0,
            title: 'Conectar seu banco',
            to: '/integrations#finance',
          },
        ]
      : []),
    {
      action: 'Importar extrato',
      detail: 'OFX, CSV, planilha ou o PDF da fatura. Importar de novo não duplica.',
      done: holder.month.expenses.length > 0 || holder.previous.expenses.length > 0,
      title: 'Importar um extrato',
      to: '/caishen/entries',
    },
    ...(whatsapp?.available
      ? [
          {
            action: 'Ligar o WhatsApp',
            detail: 'Mande "gastei 42 no almoço" e ele propõe o lançamento para você confirmar.',
            done: whatsapp.connected,
            title: 'Falar com o Caveguy no WhatsApp',
            to: '/integrations#whatsapp',
          },
        ]
      : []),
  ];
  if (steps.every(step => step.done)) return null;
  // The first step not done is the one to act on; the rest wait their turn.
  const next = steps.findIndex(step => !step.done);

  return (
    <Card className="min-w-0 gap-0 pb-2">
      <div className="flex flex-col gap-1 pb-5">
        <h2 className="text-lg font-semibold">Primeiros passos</h2>
        <p className="text-muted-foreground">
          {steps.length === 1 ? 'Um passo' : `${steps.length} passos`} para o Caveguy ver o seu mês
          inteiro.
        </p>
      </div>
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li className="flex gap-3.5 border-t py-5" key={step.title}>
            <span
              aria-hidden
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold',
                step.done
                  ? 'bg-success text-white ring-4 ring-success/15'
                  : 'border border-primary text-primary'
              )}
            >
              {step.done ? <CheckIcon className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.9375rem] font-semibold">
                  {step.title}
                  {step.done && <span className="sr-only"> (feito)</span>}
                </span>
                <span className="text-muted-foreground">{step.detail}</span>
              </div>
              {index === next && (
                <Button asChild className="self-start" size="sm">
                  <Link to={step.to}>{step.action}</Link>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

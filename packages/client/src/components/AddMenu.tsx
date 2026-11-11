import {
  ArrowDownLeftIcon,
  BanknoteIcon,
  CarIcon,
  CreditCardIcon,
  LandmarkIcon,
  MessageCircleIcon,
  ReceiptIcon,
  RepeatIcon,
  ShoppingBagIcon,
  type LucideIcon,
} from 'lucide-react';
import { lazy, Suspense, useState, type ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@zapbots/ui/components/dropdown-menu';

import type { EntryKind } from '../pages/FinancePage';
import { useChatPanel } from './ChatPanel';

// The forms load only when one is picked, so the menu adds nothing to the first load.
const AddEntryDialog = lazy(async () => ({
  default: (await import('../pages/FinancePage')).AddEntryDialog,
}));

interface Option {
  icon: LucideIcon;
  kind: EntryKind;
  label: string;
}

/** What the + adds, as people say it: what goes out, then what comes in. */
const GROUPS: { label: string; options: Option[] }[] = [
  {
    label: 'Sai',
    options: [
      { icon: ShoppingBagIcon, kind: 'EXPENSE', label: 'Gasto' },
      { icon: RepeatIcon, kind: 'RECURRING', label: 'Gasto recorrente' },
      { icon: LandmarkIcon, kind: 'LOAN', label: 'Empréstimo' },
      { icon: CarIcon, kind: 'FINANCING', label: 'Financiamento' },
      { icon: CreditCardIcon, kind: 'CARD', label: 'Cartão de crédito' },
      { icon: ReceiptIcon, kind: 'TAX', label: 'Imposto' },
    ],
  },
  {
    label: 'Entra',
    options: [
      { icon: BanknoteIcon, kind: 'ONE_OFF_INCOME', label: 'Receita avulsa' },
      { icon: ArrowDownLeftIcon, kind: 'INCOME', label: 'Renda fixa' },
    ],
  },
];

/**
 * The + opens what can be added right there, above it; picking one opens that form alone
 * (`AddEntryDialog`). Saying it to the Agente is the last option.
 */
export function AddMenu({
  align = 'end',
  children,
}: {
  align?: 'center' | 'end';
  /** The + itself, the menu's trigger. */
  children: ReactNode;
}) {
  const [kind, setKind] = useState<EntryKind | null>(null);
  const { openAdd } = useChatPanel();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="w-64 rounded-2xl p-1.5"
          side="top"
          sideOffset={12}
        >
          {GROUPS.map(group => (
            <div key={group.label}>
              <DropdownMenuLabel className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              {group.options.map(option => (
                <DropdownMenuItem
                  className="gap-3 rounded-xl px-3 py-2.5"
                  key={option.kind}
                  onSelect={() => setKind(option.kind)}
                >
                  <option.icon className="size-[18px] text-muted-foreground" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </div>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-3 rounded-xl px-3 py-2.5" onSelect={openAdd}>
            <MessageCircleIcon className="size-[18px] text-muted-foreground" />
            Dizer ao Agente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {kind && (
        <Suspense fallback={null}>
          <AddEntryDialog kind={kind} onClose={() => setKind(null)} />
        </Suspense>
      )}
    </>
  );
}

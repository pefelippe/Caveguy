import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@zapbots/ui/lib/utils';

import { formatCents } from '../lib/format';

// Only the first screen after the app loads counts up; later ones show their sums at once.
let counting = true;
let countingEnds: number | undefined;

/** A sum of money that counts up to its value when the app loads, and glides when it changes. */
export function CountUp({ cents, className }: { cents: number; className?: string }) {
  const node = useRef<HTMLSpanElement>(null);
  const shown = useRef(counting ? 0 : cents);
  const still = useReducedMotion();
  useEffect(() => {
    countingEnds ??= window.setTimeout(() => (counting = false), 1500);
  }, []);
  useEffect(() => {
    const paint = (value: number) => {
      shown.current = value;
      if (node.current) node.current.textContent = formatCents(Math.round(value));
    };
    if (still || shown.current === cents) return paint(cents);
    const run = animate(shown.current, cents, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: paint,
    });
    return () => run.stop();
  }, [cents, still]);
  return (
    <span className={cn('tabular-nums', className)} ref={node}>
      {formatCents(shown.current)}
    </span>
  );
}

export interface BarPart {
  cents: number;
  label: string;
  /** A background class: soot, the seal's red, or a faint soot for what is left. */
  swatch: string;
}

/** One bar split into its parts, with a legend under it that names each and its amount. */
export function SplitBar({
  lead,
  parts,
  whole,
}: {
  /** A figure shown first in the legend, without a swatch (what the parts come out of). */
  lead?: { cents: number; label: string };
  parts: BarPart[];
  /** The bar's full length; the parts' sum when left out. */
  whole?: number;
}) {
  const length =
    Math.max(
      whole ?? 0,
      parts.reduce((total, part) => total + part.cents, 0)
    ) || 1;
  return (
    <div className="mt-2 flex flex-col gap-3">
      <div aria-hidden className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-muted">
        {parts.map(
          part =>
            part.cents > 0 && (
              <span
                className={cn('h-full first:rounded-l-full last:rounded-r-full', part.swatch)}
                key={part.label}
                style={{ width: `${(part.cents / length) * 100}%` }}
                title={`${part.label}: ${formatCents(part.cents)}`}
              />
            )
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {lead && (
          <div>
            <dt className="text-muted-foreground">{lead.label}</dt>
            <dd className="font-medium tabular-nums">{formatCents(lead.cents)}</dd>
          </div>
        )}
        {parts.map(part => (
          <div key={part.label}>
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <span className={cn('size-2.5 shrink-0 rounded-sm', part.swatch)} />
              {part.label}
            </dt>
            <dd className="font-medium tabular-nums">{formatCents(part.cents)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Each item as a bar against the largest, largest first; an item with `to` links there. */
export function RankBars({
  items,
}: {
  items: { cents: number; id: string; label: string; to?: string }[];
}) {
  const sorted = [...items].sort((a, b) => b.cents - a.cents);
  const top = sorted[0]?.cents || 1;
  return (
    <ul className="my-1 flex flex-col gap-2.5">
      {sorted.map(item => {
        const body = (
          <>
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate group-hover:underline">{item.label}</span>
              <span className="font-medium tabular-nums">{formatCents(item.cents)}</span>
            </span>
            <span className="h-2 rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-foreground"
                style={{ width: `${(item.cents / top) * 100}%` }}
              />
            </span>
          </>
        );
        return (
          <li key={item.id}>
            {item.to ? (
              <Link className="group flex flex-col gap-1" to={item.to}>
                {body}
              </Link>
            ) : (
              <div className="flex flex-col gap-1">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

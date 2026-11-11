import type { BotKey } from '@zapbots/graphql/client';
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { NavLink, Outlet, useLocation, useOutlet } from 'react-router-dom';

import { PageSkeleton } from '@zapbots/ui/blocks/page-skeleton';
import { cn } from '@zapbots/ui/lib/utils';

import { activeItem, useNav } from '../lib/nav';
import { PAGE, Scrolling } from './Layout';

/** Finanças' screens as a row of pills, after Pierre's: the open one filled; it scrolls sideways
 * on a phone. */
function FinanceTabs() {
  const { pathname } = useLocation();
  const tabs = useNav().groups[0]!.items;
  const open = activeItem(tabs, pathname);
  return (
    <nav
      aria-label="Finanças"
      className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:justify-center md:px-0 print:hidden"
    >
      {tabs.map(tab => (
        <NavLink
          className={cn(
            'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4',
            tab === open &&
              'border-foreground bg-foreground text-background hover:bg-foreground hover:text-background'
          )}
          key={tab.to}
          to={tab.to}
        >
          <tab.icon />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * The new screen replaces the old at once and fades in, rising a little (no
 * waiting for the old one to fade out), a skeleton while it loads. Each screen opens at its top,
 * unless the address names a part of it (`#taxes`), which the page brings into view itself.
 */
function Tabbed() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const still = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  // Only on a new screen: picking another period of the Transações changes the query, not this.
  useLayoutEffect(() => {
    if (!window.location.hash) scroller.current?.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <div
      className="relative h-full overflow-y-auto print:h-auto print:overflow-visible"
      ref={scroller}
    >
      <div className={PAGE}>
        <FinanceTabs />
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: still ? 0 : 6 }}
          key={pathname}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<PageSkeleton />}>{outlet}</Suspense>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * A Bot's page: the open section of what its field needs. Finanças is the Visão geral (with the
 * Transações at its foot) and the screens opened from it, all in the header's navbar.
 */
export function BotLayout({ bot }: { bot: BotKey }) {
  // Finanças' screens load together, so moving between them never waits on code.
  useEffect(() => {
    if (bot !== 'FINANCE') return;
    void import('../pages/MoneyPage');
    void import('../pages/CategoriesPage');
    void import('../pages/FinancePage');
    void import('../pages/EntriesPage');
    void import('../pages/PayoffPage');
    void import('../pages/CreditOperationPage');
  }, [bot]);

  if (bot !== 'FINANCE') {
    return (
      <div className="h-full min-h-0" data-bot={bot}>
        <Scrolling>
          <Outlet />
        </Scrolling>
      </div>
    );
  }
  return (
    <div className="h-full min-h-0" data-bot={bot}>
      <Tabbed />
    </div>
  );
}

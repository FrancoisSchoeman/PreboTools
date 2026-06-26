'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  { href: '', label: 'Dashboard' },
  { href: '/submissions', label: 'Form Submissions' },
  { href: '/google', label: 'Google Offline Imports' },
  { href: '/smtp', label: 'SMTP' },
  { href: '/api', label: 'API' },
  { href: '/activity', label: 'Activity Log' },
  { href: '/settings', label: 'Settings' },
];

export default function ClientSidebar({
  clientId,
  companyName,
}: {
  clientId: number;
  companyName: string;
}) {
  const pathname = usePathname();
  const base = `/lead-gen/clients/${clientId}`;

  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Client
        </p>
        <p className="font-semibold">{companyName}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const href = `${base}${item.href}`;
          const active =
            item.href === ''
              ? pathname === base
              : pathname.startsWith(href);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

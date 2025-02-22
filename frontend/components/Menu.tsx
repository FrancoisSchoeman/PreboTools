import Link from 'next/link';
import AuthHeader from './auth/AuthHeader';
import { ThemeToggle } from './ThemeToggle';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Menu() {
  return (
    <div className="w-full flex flex-col md:flex-row md:w-auto items-start md:items-center justify-between gap-2">
      <ul className="flex flex-col p-1 items-start md:items-center mt-4 border border-neutral-100 rounded-lg bg-white dark:bg-neutral-800 md:flex-row md:mt-0 md:text-sm md:font-medium md:border-0 dark:border-neutral-700 gap-1">
        <li className="h-fit p-1 my-0 text-base hover:bg-neutral-700 hover:text-white rounded-md transition-colors">
          <Link href="/">Home</Link>
        </li>
        <li className="h-fit p-1 my-0 text-base hover:bg-neutral-700 hover:text-white rounded-md transition-colors">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>AI Feed Optimiser</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/feed-optimiser">AI Feed Optimiser</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/feed-optimiser/all">All Feeds</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
        <li className="h-fit p-1 my-0 text-base hover:bg-neutral-700 hover:text-white rounded-md transition-colors">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>SEO Analyser</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/seo-analysis">SEO Analyser</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/seo-analysis/all">All Analysed Keywords</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>

      <div className="flex gap-2 justify-between">
        <AuthHeader />
        <ThemeToggle />
      </div>
    </div>
  );
}

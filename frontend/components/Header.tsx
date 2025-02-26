import Menu from './Menu';
import Logo from './Logo';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  return (
    <nav className="z-10 sticky top-0 m-1 md:m-0 md:top-4">
      <div className="container border-b dark:border-neutral-800 backdrop-blur-md bg-gradient-to-r from-neutral-50/50 to-neutral-300/50 dark:from-neutral-600/50 dark:to-neutral-950/50 mx-auto flex flex-wrap items-center justify-between p-4 rounded-lg shadow-lg header-hover">
        <Logo />

        <div className="hidden md:block">
          <Menu />
        </div>

        <div className="block md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Menu</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Main Menu</SheetTitle>
              </SheetHeader>
              <Menu />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

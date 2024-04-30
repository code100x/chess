import { useState, useEffect } from 'react';
import { MenuIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SideNav } from '@/components/side-nav';
import { UpperNavItems, LowerNavItems } from '@/components/constants/side-nav';

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <div className="flex items-center justify-center gap-2">
            <MenuIcon />
            <h1 className="text-lg font-semibold">100xchess</h1>
          </div>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-36 text-muted-foreground flex flex-col h-full justify-between"
        >
          <div className="flex flex-col justify-start">
            <h1 className="text-center text-white text-2xl font-bold tracking-tighter ">
              100xchess
            </h1>
            <SideNav items={UpperNavItems} setOpen={setOpen} />
          </div>
          <div className="flex flex-col justify-end mb-2">
            <SideNav items={LowerNavItems} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

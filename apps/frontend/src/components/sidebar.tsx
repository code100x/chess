import { useState } from 'react';
import { SideNav } from '@/components/side-nav';
import { NavItems } from '@/components/constants/side-nav';

import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { isOpen, toggle } = useSidebar();
  const [status, setStatus] = useState(false);

  const handleToggle = () => {
    setStatus(true);
    toggle();
    setTimeout(() => setStatus(false), 500);
  };
  return (
    <nav
      className={cn(
        `relative hidden h-screen pt-20 md:block bg-stone-800 text-muted-foreground`,
        status && 'duration-500',
        isOpen ? 'w-52' : 'w-[78px]',
        className,
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mt-3 space-y-1">
            {isOpen && (
              <span className="text-center text-white text-2xl font-bold tracking-tighter">
                100xchess
              </span>
            )}
            <SideNav
              className="text-background opacity-0 transition-all duration-300 group-hover:z-50 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100"
              items={NavItems}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

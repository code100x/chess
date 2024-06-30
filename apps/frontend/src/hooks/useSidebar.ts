import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSidebar = create<SidebarStore>((set: any) => ({
  isOpen: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggle: () => set((state: any) => ({ isOpen: !state.isOpen })),
}));

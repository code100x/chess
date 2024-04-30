import { PuzzleIcon, LogInIcon, SettingsIcon } from 'lucide-react';
export const NavItems = [
  {
    title: 'Play',
    icon: PuzzleIcon,
    href: '/game/random',
    color: 'text-green-500',
  },
  // {
  //   title: 'Puzzles',
  //   icon: BookOpenCheck,
  //   href: '/example',
  //   color: 'text-orange-500',
  //   isChidren: true,
  //   children: [
  //     {
  //       title: 'Example-01',
  //       icon: BookOpenCheck,
  //       color: 'text-red-500',
  //       href: '/example/employees',
  //     },
  //     {
  //       title: 'Example-02',
  //       icon: BookOpenCheck,
  //       color: 'text-red-500',
  //       href: '/example/example-02',
  //     },
  //     {
  //       title: 'Example-03',
  //       icon: BookOpenCheck,
  //       color: 'text-red-500',
  //       href: '/example/example-03',
  //     },
  //   ],
  // },
  // {
  //   title: 'Puzzles',
  //   icon: PuzzleIcon,
  //   href: '/',
  //   color: 'text-sky-500',
  // },
  // {
  //   title: 'Learn',
  //   icon: PuzzleIcon,
  //   href: '/',
  //   color: 'text-sky-500',
  // },
  {
    title: 'Login',
    icon: LogInIcon,
    href: '/login',
    color: 'text-green-500',
  },
  {
    title: 'Settings',
    icon: SettingsIcon,
    href: '/',
    color: 'text-green-500',
  },
];

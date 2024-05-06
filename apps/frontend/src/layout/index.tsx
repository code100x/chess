import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="flex h-screen border-collapse overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 bg-secondary/10 pb-1 chess-board">
          {children}
        </main>
      </div>
      {/* <Footer /> */}
    </>
  );
};

import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuToggle={toggleMobileMenu} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </div>
  );
}

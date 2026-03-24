import { Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 lg:px-6">
      {/* Izquierda: hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-md text-text-secondary hover:bg-surface-hover transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center font-bold text-primary-dark text-xs">
            SP
          </div>
          <span className="font-semibold text-sm text-text-primary">
            San Patricio
          </span>
        </div>
      </div>

      {/* Derecha: notificaciones + avatar */}
      <div className="flex items-center gap-2">
        <button
          className={cn(
            'relative p-2 rounded-md text-text-secondary',
            'hover:bg-surface-hover transition-colors',
          )}
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-text-inverse">
          EJ
        </div>
      </div>
    </header>
  );
}

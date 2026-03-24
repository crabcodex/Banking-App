import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Landmark, UserPlus, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const items: MobileNavItem[] = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/accounts', label: 'Cuentas', icon: Landmark },
  { to: '/accounts/new', label: 'Abrir', icon: UserPlus },
  { to: '/notifications', label: 'Alertas', icon: Bell },
  { to: '/more', label: 'Más', icon: Menu },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden flex items-center justify-around border-t border-border bg-surface h-14">
      {items.map((item) => {
        const isActive =
          item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 transition-colors',
              isActive ? 'text-primary' : 'text-text-muted',
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

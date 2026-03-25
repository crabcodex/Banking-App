import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Landmark, ArrowLeftRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminMobileNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const items: AdminMobileNavItem[] = [
  { to: '/admin', label: 'Inicio', icon: LayoutDashboard },
  { to: '/admin/customers', label: 'Clientes', icon: Users },
  { to: '/admin/accounts', label: 'Cuentas', icon: Landmark },
  { to: '/admin/transfers', label: 'Transf.', icon: ArrowLeftRight },
  { to: '/admin/more', label: 'Mas', icon: Menu },
];

export function AdminMobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden flex items-center justify-around border-t border-border bg-surface h-14">
      {items.map((item) => {
        const isActive =
          item.to === '/admin'
            ? location.pathname === '/admin'
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

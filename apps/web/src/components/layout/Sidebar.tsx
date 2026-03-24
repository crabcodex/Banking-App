import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  UserPlus,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Cuentas', icon: Landmark },
  { to: '/accounts/new', label: 'Abrir Cuenta', icon: UserPlus },
];

const bottomItems: NavItem[] = [
  { to: '/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-primary-dark text-text-inverse transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-accent flex items-center justify-center font-bold text-primary-dark text-sm">
          SP
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm whitespace-nowrap">
            Banco San Patricio
          </span>
        )}
      </div>

      {/* Nav principal */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-white/15 text-accent-light'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-0',
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Nav inferior */}
      <div className="py-4 px-2 flex flex-col gap-1 border-t border-white/10">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
              'text-white/70 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0',
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        <button
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
            'text-white/50 hover:bg-white/10 hover:text-white w-full',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Toggle collapse */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="hidden lg:flex items-center justify-center h-10 border-t border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}

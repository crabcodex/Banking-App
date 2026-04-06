import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Landmark,
  ArrowLeftRight,
  HandCoins,
  ShieldAlert,
  FileBarChart,
  ScrollText,
  UserCog,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/customers', label: 'Clientes', icon: Users },
  { to: '/admin/accounts', label: 'Cuentas', icon: Landmark },
  { to: '/admin/transfers', label: 'Transferencias', icon: ArrowLeftRight },
  { to: '/admin/loans', label: 'Creditos', icon: HandCoins },
  { to: '/admin/compliance', label: 'PLD / AML', icon: ShieldAlert },
  { to: '/admin/reports', label: 'Reportes', icon: FileBarChart },
  { to: '/admin/audit', label: 'Auditoria', icon: ScrollText },
  { to: '/admin/users', label: 'Usuarios', icon: UserCog },
];

const bottomItems: NavItem[] = [
  { to: '/admin/settings', label: 'Configuracion', icon: Settings },
];

interface AdminSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ mobile, onClose }: AdminSidebarProps) {
  const location = useLocation();

  const handleNavClick = () => {
    if (mobile && onClose) onClose();
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-[#f0f4f3] text-[#065143] w-64 transition-all border-r border-[#065143]/10 z-20',
        mobile ? 'h-full' : 'hidden md:flex h-full',
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-20">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#065143] flex items-center justify-center font-bold text-[#eebc47] text-sm">
            SP
          </div>
          <span className="font-bold tracking-tight text-[#065143]">
            San Patricio
          </span>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#065143]/80 hover:text-[#065143] hover:bg-[#065143]/10 transition-colors"
            aria-label="Cerrar menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav principal */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.to === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-white text-[#065143] shadow-[0_2px_10px_-4px_rgba(6,81,67,0.2)]'
                  : 'text-[#065143]/80 hover:bg-[#065143]/10 hover:text-[#065143]',
              )}
            >
              <item.icon className={cn(
                'w-[20px] h-[20px] flex-shrink-0 transition-colors',
                isActive ? 'text-[#eebc47]' : 'text-[#065143]/70'
              )} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Nav inferior */}
      <div className="py-6 px-4 flex flex-col gap-1 mt-auto">
        <div className="h-px bg-[#065143]/10 mx-2 mb-4" />
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-[#065143]/80 hover:bg-[#065143]/10 hover:text-[#065143]"
          >
            <item.icon className="w-[20px] h-[20px] flex-shrink-0 text-[#065143]/70" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-rose-600/90 hover:bg-rose-100 hover:text-rose-700 w-full mt-1"
        >
          <LogOut className="w-[20px] h-[20px] flex-shrink-0 text-rose-600/80" />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </aside>
  );
}

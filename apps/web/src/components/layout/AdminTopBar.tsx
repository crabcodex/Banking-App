import { Bell, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function AdminTopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-8 w-full shrink-0 z-10">
      {/* Izquierda: hamburger (mobile) o Breadcrumbs/Date (desktop) */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-[#065143]/80 hover:bg-[#065143]/10 hover:text-[#065143] transition-all bg-white shadow-sm border border-[#065143]/20"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Buscador minimalista */}
        <div className="hidden md:flex relative group">
          <Search className="w-4 h-4 text-[#065143]/70 absolute left-0 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-7 pr-4 py-2 w-64 bg-transparent border-none focus:outline-none text-sm placeholder:text-[#065143]/70 text-[#065143] font-medium"
          />
        </div>
      </div>

      {/* Derecha: notificaciones + avatar */}
      <div className="flex items-center gap-5">
        <button
          className="relative text-[#065143]/80 hover:text-[#065143] transition-all"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#eebc47]"></span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-[#065143]/10 flex items-center justify-center text-xs font-bold text-[#065143] group-hover:border-[#065143]/30 transition-all">
            EJ
          </div>
        </div>
      </div>
    </header>
  );
}

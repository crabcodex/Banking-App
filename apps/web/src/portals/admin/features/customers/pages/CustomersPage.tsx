import { Link } from 'react-router-dom';
import { Badge, Button } from '@/components/ui';
import { Search, Eye } from 'lucide-react';

const MOCK_CUSTOMERS = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Juan Carlos Mendoza Rivera',
    curp: 'MERJ850315HDFRXN09',
    rfc: 'MERJ850315AB1',
    email: 'jc.mendoza@correo.com',
    phone: '+52 55 1234 5678',
    status: 'ACTIVE' as const,
    since: '2024-03-10',
  },
];

const statusMap = {
  ACTIVE: { label: 'Activo', variant: 'success' as const },
  INACTIVE: { label: 'Inactivo', variant: 'neutral' as const },
  BLOCKED: { label: 'Bloqueado', variant: 'danger' as const },
};

export function CustomersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Busqueda y gestion de clientes del banco.
          </p>
        </div>
      </div>

      {/* Barra de busqueda */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre, CURP, RFC o telefono..."
          className="w-full h-10 rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-border-focus"
          defaultValue="Juan Carlos"
        />
      </div>

      {/* Tabla de clientes */}
      <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover/50">
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">CURP</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">RFC</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Estatus</th>
              <th className="text-right px-4 py-3 font-medium text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CUSTOMERS.map((c) => {
              const st = statusMap[c.status];
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-hover/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-text-primary">{c.name}</span>
                      <span className="block text-xs text-text-muted md:hidden">{c.curp}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-mono text-xs hidden md:table-cell">{c.curp}</td>
                  <td className="px-4 py-3 text-text-secondary font-mono text-xs hidden lg:table-cell">{c.rfc}</td>
                  <td className="px-4 py-3">
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/customers/${c.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Ver perfil</span>
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

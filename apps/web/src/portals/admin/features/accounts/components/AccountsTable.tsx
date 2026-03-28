import { Badge } from '@/components/ui';
import type { AccountListItem } from '../api/types';

const statusMap: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'neutral' }> = {
  ACTIVE: { label: 'Activa', variant: 'success' },
  FROZEN: { label: 'Congelada', variant: 'warning' },
  CLOSED: { label: 'Cerrada', variant: 'neutral' },
};

const typeLabels: Record<string, string> = {
  AHORRO: 'Ahorro',
  CHEQUES: 'Cheques',
  NOMINA: 'Nómina',
  INVERSION: 'Inversión',
  EMPRESARIAL: 'Empresarial',
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

interface AccountsTableProps {
  items: AccountListItem[];
  loading?: boolean;
}

export function AccountsTable({ items, loading }: AccountsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-text-secondary">
        Cargando cuentas...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-text-secondary">
        No se encontraron cuentas con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-hover/50">
            <th className="text-left px-4 py-3 font-medium text-text-secondary">Alias</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Tipo</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">CLABE</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary">Moneda</th>
            <th className="text-right px-4 py-3 font-medium text-text-secondary">Saldo</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary">Estatus</th>
            <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">Apertura</th>
          </tr>
        </thead>
        <tbody>
          {items.map((account) => {
            const st = statusMap[account.status] ?? { label: account.status, variant: 'neutral' as const };
            return (
              <tr
                key={account.id}
                className="border-b border-border last:border-0 hover:bg-surface-hover/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium text-text-primary">{account.alias}</span>
                    <span className="block text-xs text-text-muted md:hidden">
                      {typeLabels[account.type] ?? account.type}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                  {typeLabels[account.type] ?? account.type}
                </td>
                <td className="px-4 py-3 text-text-secondary font-mono text-xs hidden lg:table-cell">
                  {account.clabe}
                </td>
                <td className="px-4 py-3 text-text-secondary">{account.currency}</td>
                <td className="px-4 py-3 text-right font-mono text-text-primary">
                  {currencyFormatter.format(Number(account.balance))}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={st.variant}>{st.label}</Badge>
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs hidden lg:table-cell">
                  {dateFormatter.format(new Date(account.openedAt))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

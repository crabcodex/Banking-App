import { Badge, Card, CardContent } from '@/components/ui';
import type { AccountListItem } from '@/portals/admin/features/accounts/api/types';

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

interface MyAccountCardProps {
  account: AccountListItem;
}

export function MyAccountCard({ account }: MyAccountCardProps) {
  const st = statusMap[account.status] ?? { label: account.status, variant: 'neutral' as const };
  const maskedClabe = `****${account.clabe.slice(-4)}`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-text-primary">{account.alias}</h3>
            <p className="text-xs text-text-muted">
              {typeLabels[account.type] ?? account.type} &middot; {account.currency}
            </p>
          </div>
          <Badge variant={st.variant}>{st.label}</Badge>
        </div>
        <p className="text-2xl font-bold text-text-primary mb-2">
          ${currencyFormatter.format(Number(account.balance))}
          <span className="text-sm font-normal text-text-muted ml-1">{account.currency}</span>
        </p>
        <p className="text-xs text-text-muted font-mono">
          CLABE: {maskedClabe}
        </p>
      </CardContent>
    </Card>
  );
}

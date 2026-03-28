import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Select } from '@/components/ui';
import { useMyAccounts } from '../hooks/useMyAccounts';
import { MyAccountCard } from '../components/MyAccountCard';

const TYPE_OPTIONS = [
  { value: '', label: 'Todas las cuentas' },
  { value: 'AHORRO', label: 'Ahorro' },
  { value: 'CHEQUES', label: 'Cheques' },
  { value: 'NOMINA', label: 'Nómina' },
  { value: 'INVERSION', label: 'Inversión' },
  { value: 'EMPRESARIAL', label: 'Empresarial' },
] as const;

export function MyAccountsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const { data, isLoading } = useMyAccounts(typeFilter || undefined);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Mis Cuentas</h1>
            <p className="text-sm text-text-secondary">Resumen de tus cuentas bancarias.</p>
          </div>
        </div>
        <div className="w-40">
          <Select
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filtrar por tipo"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-sm text-text-secondary">
          Cargando tus cuentas...
        </div>
      ) : (data?.data.items.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Wallet className="h-8 w-8 text-text-muted mb-3" />
          <p className="text-sm text-text-secondary">No tienes cuentas registradas.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data!.data.items.map((account) => (
            <MyAccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}

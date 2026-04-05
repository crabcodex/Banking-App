import { Select, Button } from '@/components/ui';
import { ACCOUNT_TYPES } from '../schemas/openAccountSchema';
import { Search, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'FROZEN', label: 'Congelada' },
  { value: 'CLOSED', label: 'Cerrada' },
] as const;

const TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  ...ACCOUNT_TYPES,
] as const;

const CURRENCY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'MXN', label: 'MXN' },
  { value: 'USD', label: 'USD' },
] as const;

export interface AccountFiltersValue {
  clabe: string;
  type: string;
  currency: string;
  status: string;
}

interface AccountFiltersProps {
  value: AccountFiltersValue;
  onChange: (value: AccountFiltersValue) => void;
}

export function AccountFilters({ value, onChange }: AccountFiltersProps) {
  const update = (field: keyof AccountFiltersValue, v: string) => {
    onChange({ ...value, [field]: v });
  };

  const hasFilters = value.clabe || value.type || value.currency || value.status;

  const handleClear = () => {
    onChange({ clabe: '', type: '', currency: '', status: '' });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          aria-label="Buscar por CLABE"
          placeholder="Buscar por CLABE…"
          value={value.clabe}
          onChange={(e) => update('clabe', e.target.value)}
          className="w-full h-10 rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-border-focus"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-3">
        <Select
          options={TYPE_OPTIONS}
          value={value.type}
          onChange={(e) => update('type', e.target.value)}
          aria-label="Tipo de cuenta"
        />
        <Select
          options={CURRENCY_OPTIONS}
          value={value.currency}
          onChange={(e) => update('currency', e.target.value)}
          aria-label="Moneda"
        />
        <Select
          options={STATUS_OPTIONS}
          value={value.status}
          onChange={(e) => update('status', e.target.value)}
          aria-label="Estatus"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear} aria-label="Limpiar filtros">
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

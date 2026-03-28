import { useState, useMemo } from 'react';
import { Landmark } from 'lucide-react';
import { useSearchAccounts } from '../hooks/useSearchAccounts';
import { AccountFilters, type AccountFiltersValue } from '../components/AccountFilters';
import { AccountsTable } from '../components/AccountsTable';
import { AccountsPagination } from '../components/AccountsPagination';
import type { AccountFilter, SearchAccountsRequest } from '../api/types';

const LIMIT = 20;

export function AccountsListPage() {
  const [filters, setFilters] = useState<AccountFiltersValue>({
    clabe: '',
    type: '',
    currency: '',
    status: '',
  });
  const [offset, setOffset] = useState(0);

  const criteria: SearchAccountsRequest = useMemo(() => {
    const apiFilters: AccountFilter[] = [];

    if (filters.clabe) {
      apiFilters.push({ field: 'clabe', operator: 'CONTAINS', value: filters.clabe });
    }
    if (filters.type) {
      apiFilters.push({ field: 'type', operator: 'EQUALS', value: filters.type });
    }
    if (filters.currency) {
      apiFilters.push({ field: 'currency', operator: 'EQUALS', value: filters.currency });
    }
    if (filters.status) {
      apiFilters.push({ field: 'status', operator: 'EQUALS', value: filters.status });
    }

    return {
      filters: apiFilters,
      order: { field: 'openedAt' as const, direction: 'DESC' as const },
      limit: LIMIT,
      offset,
    };
  }, [filters, offset]);

  const { data, isLoading } = useSearchAccounts(criteria);

  const handleFiltersChange = (value: AccountFiltersValue) => {
    setFilters(value);
    setOffset(0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Cuentas</h1>
            <p className="text-sm text-text-secondary">
              Busca cuentas por CLABE, tipo, moneda o estatus.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <AccountFilters value={filters} onChange={handleFiltersChange} />
      </div>

      <AccountsTable items={data?.data.items ?? []} loading={isLoading} />
      {data?.data && (
        <AccountsPagination
          total={data.data.total}
          limit={data.data.limit}
          offset={data.data.offset}
          onPageChange={setOffset}
        />
      )}
    </div>
  );
}

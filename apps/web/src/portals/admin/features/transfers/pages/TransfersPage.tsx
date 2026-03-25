import { ArrowLeftRight } from 'lucide-react';

export function TransfersPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <ArrowLeftRight className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary">Transferencias</h1>
      <p className="mt-2 text-sm text-text-secondary max-w-md">
        Autorizacion de transferencias, historial de operaciones y conciliacion interbancaria.
      </p>
      <span className="mt-4 inline-flex items-center rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
        Proximamente
      </span>
    </div>
  );
}

import { ShieldAlert } from 'lucide-react';

export function CompliancePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary">PLD / AML</h1>
      <p className="mt-2 text-sm text-text-secondary max-w-md">
        Prevencion de Lavado de Dinero. Alertas, reportes regulatorios CNBV y listas de personas bloqueadas.
      </p>
      <span className="mt-4 inline-flex items-center rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
        Proximamente
      </span>
    </div>
  );
}

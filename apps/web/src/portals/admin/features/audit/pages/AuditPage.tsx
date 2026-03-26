import { ScrollText } from 'lucide-react';

export function AuditPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <ScrollText className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary">Auditoria</h1>
      <p className="mt-2 text-sm text-text-secondary max-w-md">
        Log de eventos del sistema, trazabilidad de cambios, accesos y operaciones criticas.
      </p>
      <span className="mt-4 inline-flex items-center rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
        Proximamente
      </span>
    </div>
  );
}

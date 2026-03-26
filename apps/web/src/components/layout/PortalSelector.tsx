import { Link } from 'react-router-dom';
import { ShieldCheck, Wallet } from 'lucide-react';

export function PortalSelector() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-2 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent font-bold text-primary-dark text-2xl">
            SP
          </div>
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Banco San Patricio</h1>
        <p className="mt-2 text-text-secondary">Selecciona el portal al que deseas acceder</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            to="/admin"
            className="group flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-8 shadow-card transition-all duration-200 hover:border-primary hover:shadow-lg"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-text-inverse">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Portal Administrativo</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Gestión de cuentas, clientes y operaciones bancarias
              </p>
            </div>
          </Link>

          <Link
            to="/portal"
            className="group flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-8 shadow-card transition-all duration-200 hover:border-accent hover:shadow-lg"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-primary-dark">
              <Wallet className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Banca Digital</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Consulta de saldos, transferencias y servicios
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

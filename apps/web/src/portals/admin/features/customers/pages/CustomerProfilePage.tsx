import { Link, useParams, Outlet } from 'react-router-dom';
import { Card, CardHeader, CardContent, Badge, Button } from '@/components/ui';
import { ArrowLeft, UserPlus, Mail, Phone, Calendar, CreditCard, FileText } from 'lucide-react';

const MOCK_CUSTOMER = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Juan Carlos Mendoza Rivera',
  curp: 'MERJ850315HDFRXN09',
  rfc: 'MERJ850315AB1',
  email: 'jc.mendoza@correo.com',
  phone: '+52 55 1234 5678',
  status: 'ACTIVE' as const,
  since: '2024-03-10',
  address: 'Av. Reforma 222, Col. Juarez, CDMX, 06600',
  accounts: [
    { id: '1', type: 'Ahorro', clabe: '012345678901234567', currency: 'MXN', balance: 45_320.50, status: 'ACTIVE' },
  ],
};

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-xs text-text-muted uppercase tracking-wide">{label}</span>
        <p className="text-sm text-text-primary">{value}</p>
      </div>
    </div>
  );
}

export function CustomerProfilePage() {
  const { customerId } = useParams<{ customerId: string }>();
  const customer = MOCK_CUSTOMER;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{customer.name}</h1>
          <p className="text-sm text-text-muted font-mono">{customerId}</p>
        </div>
        <Badge variant="success">Activo</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos personales */}
        <div className="lg:col-span-1">
        <Card>
          <CardHeader title="Datos personales" />
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <InfoRow icon={FileText} label="CURP" value={customer.curp} />
              <InfoRow icon={CreditCard} label="RFC" value={customer.rfc} />
              <InfoRow icon={Mail} label="Correo" value={customer.email} />
              <InfoRow icon={Phone} label="Telefono" value={customer.phone} />
              <InfoRow icon={Calendar} label="Cliente desde" value={new Date(customer.since).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })} />
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Cuentas del cliente */}
        <div className="lg:col-span-2">
        <Card>
          <CardHeader
            title="Cuentas"
            action={
              <Link to={`/admin/customers/${customer.id}/accounts/new`}>
                <Button size="sm">
                  <UserPlus className="w-4 h-4" />
                  Abrir nueva cuenta
                </Button>
              </Link>
            }
          />
          <CardContent>
            {customer.accounts.length > 0 ? (
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover/50">
                      <th className="text-left px-4 py-2 font-medium text-text-secondary">Tipo</th>
                      <th className="text-left px-4 py-2 font-medium text-text-secondary hidden sm:table-cell">CLABE</th>
                      <th className="text-right px-4 py-2 font-medium text-text-secondary">Saldo</th>
                      <th className="text-left px-4 py-2 font-medium text-text-secondary">Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.accounts.map((acc) => (
                      <tr key={acc.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 text-text-primary">{acc.type}</td>
                        <td className="px-4 py-2 text-text-secondary font-mono text-xs hidden sm:table-cell">{acc.clabe}</td>
                        <td className="px-4 py-2 text-right font-mono text-text-primary">
                          ${acc.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant="success">Activa</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-4">Este cliente no tiene cuentas.</p>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

import { Button, Card, CardContent, CardFooter, CardHeader } from '@/components/ui';
import { ACCOUNT_TYPES, CURRENCIES, type OpenAccountFormData } from '../schemas/openAccountSchema';

interface ConfirmationStepProps {
  data: OpenAccountFormData;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

const typeLabel = (value: string) =>
  ACCOUNT_TYPES.find((t) => t.value === value)?.label ?? value;

const currencyLabel = (value: string) =>
  CURRENCIES.find((c) => c.value === value)?.label ?? value;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

export function ConfirmationStep({ data, onConfirm, onBack, loading }: ConfirmationStepProps) {
  return (
    <Card>
      <CardHeader
        title="Confirmar apertura"
        description="Verifica que los datos sean correctos antes de continuar."
      />
      <CardContent className="flex flex-col">
        <Row label="ID del Cliente" value={data.customerId} />
        <Row label="Tipo de Cuenta" value={typeLabel(data.type)} />
        <Row label="Moneda" value={currencyLabel(data.currency)} />
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="secondary" onClick={onBack} disabled={loading}>
          Regresar
        </Button>
        <Button onClick={onConfirm} loading={loading}>
          Confirmar y abrir cuenta
        </Button>
      </CardFooter>
    </Card>
  );
}

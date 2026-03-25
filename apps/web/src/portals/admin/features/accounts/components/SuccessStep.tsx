import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardFooter, CardHeader, Badge } from '@/components/ui';
import type { OpenAccountResponse } from '../api/types';

interface SuccessStepProps {
  result: OpenAccountResponse;
}

export function SuccessStep({ result }: SuccessStepProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader
        title="Cuenta creada exitosamente"
        action={<Badge variant="success">Activa</Badge>}
      />
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-muted uppercase tracking-wide">ID de Cuenta</span>
          <span className="text-sm font-mono text-text-primary">{result.accountId}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-muted uppercase tracking-wide">CLABE Interbancaria</span>
          <span className="text-sm font-mono text-text-primary tracking-widest">{result.clabe}</span>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="secondary" onClick={() => navigate('/')}>
          Ir al Dashboard
        </Button>
        <Button onClick={() => navigate('/accounts/new')}>
          Abrir otra cuenta
        </Button>
      </CardFooter>
    </Card>
  );
}

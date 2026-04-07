import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, Button } from '@/components/ui';
import {
  openAccountSchema,
  ACCOUNT_TYPES,
  CURRENCIES,
  type OpenAccountFormData,
} from '../schemas/openAccountSchema';

interface OpenAccountFormProps {
  onSubmit: (data: OpenAccountFormData) => void;
  defaultCustomerId?: string;
  lockCustomerId?: boolean;
}

export function OpenAccountForm({ onSubmit, defaultCustomerId, lockCustomerId }: OpenAccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpenAccountFormData>({
    resolver: zodResolver(openAccountSchema),
    defaultValues: {
      customerId: defaultCustomerId ?? '',
      type: undefined,
      currency: undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-card" noValidate>
      {lockCustomerId ? (
        <input type="hidden" {...register('customerId')} />
      ) : (
        <Input
          label="ID del Cliente"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          error={errors.customerId?.message}
          {...register('customerId')}
        />
      )}

      <Select
        label="Tipo de Cuenta"
        placeholder="Selecciona un tipo"
        options={ACCOUNT_TYPES}
        error={errors.type?.message}
        defaultValue=""
        {...register('type')}
      />

      <Select
        label="Moneda"
        placeholder="Selecciona una moneda"
        options={CURRENCIES}
        error={errors.currency?.message}
        defaultValue=""
        {...register('currency')}
      />

      <Button type="submit" className="mt-2">
        Revisar datos
      </Button>
    </form>
  );
}

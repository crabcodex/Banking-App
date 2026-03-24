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
}

export function OpenAccountForm({ onSubmit, defaultCustomerId }: OpenAccountFormProps) {
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
      alias: '',
      initialBalance: undefined as unknown as number,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Input
        label="ID del Cliente"
        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        error={errors.customerId?.message}
        {...register('customerId')}
      />

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

      <Input
        label="Alias"
        placeholder="Mi cuenta de ahorro"
        error={errors.alias?.message}
        maxLength={50}
        {...register('alias')}
      />

      <Input
        label="Saldo Inicial"
        type="number"
        placeholder="0.00"
        min="0.01"
        step="0.01"
        error={errors.initialBalance?.message}
        {...register('initialBalance', { valueAsNumber: true })}
      />

      <Button type="submit" className="mt-2">
        Revisar datos
      </Button>
    </form>
  );
}

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui';
import { useOpenAccount } from '../hooks/useOpenAccount';
import { OpenAccountForm } from '../components/OpenAccountForm';
import { ConfirmationStep } from '../components/ConfirmationStep';
import { SuccessStep } from '../components/SuccessStep';
import type { OpenAccountFormData } from '../schemas/openAccountSchema';
import type { OpenAccountResponse } from '../api/types';
import { ApiError } from '@/lib/httpClient';

type Step = 'form' | 'confirm' | 'success';

export function OpenAccountPage() {
  const [searchParams] = useSearchParams();
  const prefilledCustomerId = searchParams.get('customerId') ?? undefined;
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<OpenAccountFormData | null>(null);
  const [result, setResult] = useState<OpenAccountResponse | null>(null);
  const { toast } = useToast();
  const mutation = useOpenAccount();

  const handleFormSubmit = (data: OpenAccountFormData) => {
    setFormData(data);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!formData) return;

    mutation.mutate(formData, {
      onSuccess: (res) => {
        setResult(res.data);
        setStep('success');
        toast('Cuenta creada exitosamente', 'success');
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.body.message
            : 'Ocurrió un error inesperado';
        toast(message, 'error');
      },
    });
  };

  const handleBack = () => {
    setStep('form');
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Abrir Cuenta</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Completa el formulario para abrir una nueva cuenta bancaria.
        </p>
      </div>

      {step === 'form' && (
        <OpenAccountForm
          onSubmit={handleFormSubmit}
          defaultCustomerId={formData?.customerId ?? prefilledCustomerId}
          lockCustomerId={!!prefilledCustomerId}
        />
      )}

      {step === 'confirm' && formData && (
        <ConfirmationStep
          data={formData}
          onConfirm={handleConfirm}
          onBack={handleBack}
          loading={mutation.isPending}
        />
      )}

      {step === 'success' && result && (
        <SuccessStep result={result} />
      )}
    </div>
  );
}

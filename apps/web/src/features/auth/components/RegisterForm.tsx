import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/register.schema';
import { useRegister } from '@/features/auth/hooks/useRegister';

const initialValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const mutation = useRegister();

  const onSubmit = (data: RegisterFormData) => {
    const { email, password } = data;
    mutation.mutate({ email, password });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <div className="mt-1">
          <input
            {...register('email')}
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-2 text-white text-sm bg-red-500 font-bold">{errors.email?.message}</p>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <div className="mt-1">
          <input
            {...register('password')}
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-2 text-white text-sm bg-red-500 font-bold">{errors.password?.message}</p>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
          Confirmar contraseña
        </label>
        <div className="mt-1">
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-2 text-white text-sm bg-red-500 font-bold">
            {errors.confirmPassword?.message}
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={mutation.isPending || !isValid}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Registrando...' : 'Registrarse'}
        </button>

        {mutation.isSuccess && (
          <p className="mt-2 text-white text-sm bg-green-500 font-bold">
            ✅ {mutation.data?.message}
          </p>
        )}
        {mutation.isError && (
          <p className="mt-2 text-white text-sm bg-red-500 font-bold">
            ❌ {mutation.error?.message}
          </p>
        )}
      </div>
    </form>
  );
}

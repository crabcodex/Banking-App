import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      // TODO: Redirigir al usuario a la página de inicio de sesión
      console.log('Usuario registrado exitosamente');
    },
    onError: (error) => {
      console.log(error);
      // TODO: Mostrar un mensaje de error al usuario
    },
  });
};

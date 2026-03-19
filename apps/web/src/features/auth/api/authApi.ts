import { api } from '@/shared/api/api-client';
import type { RegisterDTO } from '@/features/auth/types/auth.types';

export const authApi = {
  async register(data: RegisterDTO) {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

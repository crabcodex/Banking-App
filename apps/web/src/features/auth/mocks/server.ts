import { setupServer } from 'msw/node';
import { authHandlers } from '@/features/auth/mocks/handlers/auth.handlers';

export const server = setupServer(...authHandlers);

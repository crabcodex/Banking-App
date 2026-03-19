import { beforeAll, afterAll, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { server } from '@/features/auth/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

import { build } from 'esbuild';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

await build({
  entryPoints: [resolve(root, 'packages/server/api/dist/server.js')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outfile: resolve(root, 'dist/server.mjs'),
  // npm packages se resuelven desde node_modules en runtime
  packages: 'external',
  // workspace packages se resuelven desde su dist/ compilado por tsc
  alias: {
    '@bank/shared': resolve(root, 'packages/core/shared/dist/index.js'),
    '@bank/event-store': resolve(root, 'packages/core/event-store/dist/index.js'),
    '@bank/projection-engine': resolve(root, 'packages/core/projection-engine/dist/index.js'),
    '@bank/messaging': resolve(root, 'packages/core/messaging/dist/index.js'),
    '@bank/accounts': resolve(root, 'packages/contexts/accounts/dist/index.js'),
    '@bank/identity': resolve(root, 'packages/contexts/identity/dist/index.js'),
    '@bank/aml': resolve(root, 'packages/contexts/aml/dist/index.js'),
    '@bank/audit': resolve(root, 'packages/contexts/audit/dist/index.js'),
    '@bank/notifications': resolve(root, 'packages/contexts/notifications/dist/index.js'),
    '@bank/transfers': resolve(root, 'packages/contexts/transfers/dist/index.js'),
  },
});

console.log('Bundle created: dist/server.mjs');

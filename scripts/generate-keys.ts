import { generateKeyPairSync } from 'crypto';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const keysDir = path.resolve(import.meta.dirname, '..', 'keys');

if (existsSync(path.join(keysDir, 'private.pem'))) {
  console.log('Las llaves ya existen en keys/. No se sobreescriben.');
  process.exit(0);
}

mkdirSync(keysDir, { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

console.log('Llaves RS256 generadas en keys/');

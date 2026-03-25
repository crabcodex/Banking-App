import { readFileSync } from 'node:fs';
import { Router, Request, Response } from 'express';
import { importPKCS8, SignJWT } from 'jose';
import { z } from 'zod';

const devTokenSchema = z.object({
  sub: z.string().uuid().default('00000000-0000-0000-0000-000000000001'),
  role: z.string().default('admin'),
  expiresIn: z.string().default('24h'),
});

/**
 * Rutas de desarrollo. Solo disponibles en NODE_ENV=development.
 * POST /api/dev/token  -> Genera un JWT RS256 firmado con la clave privada.
 */
export function devRoutes(privateKeyPath: string): Router {
  const router = Router();

  router.post('/dev/token', async (req: Request, res: Response) => {
    const parsed = devTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Body invalido', errors: parsed.error.issues });
      return;
    }

    const { sub, role, expiresIn } = parsed.data;

    const pem = readFileSync(privateKeyPath, 'utf-8');
    const privateKey = await importPKCS8(pem, 'RS256');

    const token = await new SignJWT({ sub, role })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(privateKey);

    res.json({
      success: true,
      message: 'Token de desarrollo generado',
      data: { token, sub, role, expiresIn },
    });
  });

  return router;
}

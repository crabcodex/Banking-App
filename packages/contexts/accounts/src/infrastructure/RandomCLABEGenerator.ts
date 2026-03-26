import { randomInt } from 'node:crypto';
import { injectable } from 'tsyringe';
import { CLABE } from '../domain/value-objects/CLABE';
import type { ICLABEGenerator } from '../domain/services/ICLABEGenerator';

/**
 * Genera CLABEs aleatorias de 18 dígitos con crypto seguro.
 * En producción se reemplazaría por un generador con validación Banxico.
 */
@injectable()
export class RandomCLABEGenerator implements ICLABEGenerator {
  generate(): CLABE {
    const digits = Array.from({ length: 18 }, () => randomInt(0, 10)).join('');
    return new CLABE(digits);
  }
}

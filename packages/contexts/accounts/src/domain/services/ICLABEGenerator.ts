import type { CLABE } from '../value-objects/CLABE';

/** Servicio de dominio: genera una CLABE interbancaria única de 18 dígitos. */
export interface ICLABEGenerator {
  generate(): CLABE;
}

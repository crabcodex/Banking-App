import { describe, it, expect } from 'vitest';
import { ValueObject } from '../src/domain/ValueObject';

class Email extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value.includes('@')) {
      throw new Error('Email invalido');
    }
  }
}

class Amount extends ValueObject<number> {
  protected validate(value: number): void {
    if (value < 0) {
      throw new Error('Monto no puede ser negativo');
    }
  }
}

describe('ValueObject', () => {
  it('debe crear con valor valido', () => {
    const email = new Email('user@bank.com');
    expect(email.value).toBe('user@bank.com');
  });

  it('debe lanzar error con valor invalido', () => {
    expect(() => new Email('invalido')).toThrow('Email invalido');
  });

  it('debe ser igual por valor', () => {
    const a = new Email('user@bank.com');
    const b = new Email('user@bank.com');
    expect(a.equals(b)).toBe(true);
  });

  it('debe ser diferente si los valores difieren', () => {
    const a = new Email('a@bank.com');
    const b = new Email('b@bank.com');
    expect(a.equals(b)).toBe(false);
  });

  it('debe ser inmutable (frozen)', () => {
    const amount = new Amount(100);
    expect(() => {
      (amount as any).value = 200;
    }).toThrow();
  });
});

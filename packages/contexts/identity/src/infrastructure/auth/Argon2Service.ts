import argon2 from "argon2"

export class Argon2Service {

  async hash(password: string) {
    return argon2.hash(password)
  }

  async verify(hash: string, password: string) {
    return argon2.verify(hash, password)
  }

}
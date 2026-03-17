export class Password {

  private readonly hash: string

  private constructor(hash: string) {
    this.hash = hash
  }

  static async create(
    plain: string,
    argon2Service: any
  ) {

    if (plain.length < 8) {
      throw new Error("Password too short")
    }

    const hash = await argon2Service.hash(plain)

    return new Password(hash)
  }

  getHash() {
    return this.hash
  }

}
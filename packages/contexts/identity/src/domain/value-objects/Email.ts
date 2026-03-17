export class Email {

  private readonly value: string

  constructor(value: string) {

    const normalized = value.trim().toLowerCase()

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!regex.test(normalized)) {
      throw new Error("Invalid email")
    }

    this.value = normalized
  }

  getValue() {
    return this.value
  }

}
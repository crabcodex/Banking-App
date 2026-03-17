export class RegisterCustomerCommand {

  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

}
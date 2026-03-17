import { randomUUID } from "crypto";
import { inject, injectable } from "tsyringe";
import { eq } from "drizzle-orm";



import type { IEventStore } from "@bank/shared";
import type { IEventBus } from "@bank/shared";
import type { EventMetadata } from "@bank/shared";
import { ICommandHandler } from "@bank/shared";
import { commandHandler } from "@bank/shared";
import { ReadDrizzleProvider } from "@bank/projection-engine";

import { RegisterCustomerCommand } from "./RegisterCustomerCommand";
import { customerProjection } from "../../infrastructure/projections/CustomerProjectionSchema";

import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { Customer } from "../../domain/Customer";

const metadata: EventMetadata = {
  correlationId: randomUUID(),
  causationId: randomUUID(),
  userId: "anonymous",
  channel: "web"
};

@injectable()
@commandHandler(RegisterCustomerCommand)
export class RegisterCustomerHandler
  implements ICommandHandler<RegisterCustomerCommand>
{

  constructor(
    @inject("IEventStore") private readonly eventStore: IEventStore,
    @inject("IEventBus") private readonly eventBus: IEventBus,
    @inject("Argon2Service") private readonly argon2service: any,
     @inject("ReadDrizzleProvider") private readonly readProvider: ReadDrizzleProvider
  ) {}

  async execute(command: RegisterCustomerCommand): Promise<void> {

    // 1️⃣ validar email único (read model)

  const existing = await this.readProvider.db
  .select()
  .from(customerProjection)
  .where(eq(customerProjection.email, command.email))
  .limit(1);

if (existing.length > 0) {
  throw new Error("Email already exists");
}

    // 2️⃣ value objects

    const email = new Email(command.email);

    const password = await Password.create(
      command.password,
      this.argon2service
    );

    // 3️⃣ id del agregado

    const customerId = randomUUID();

    const streamId = `customer-${customerId}`;

    // 4️⃣ ejecutar dominio

    const events = Customer.register(
      customerId,
      email.getValue(),
      password.getHash(),
      metadata
    );

    // 5️⃣ persistir eventos (OCC)

    await this.eventStore.appendToStream(
      streamId,
      events,
      -1
    );

    // 6️⃣ publicar eventos

    await this.eventBus.publish(events);
  }
}
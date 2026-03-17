import type { DomainEvent, EventMetadata } from "@bank/shared"

export class CustomerRegistered implements DomainEvent {

  readonly eventType = "CustomerRegistered"
  readonly occurredOn = new Date()

  constructor(
    public readonly aggregateId: string,
    public readonly data: {
      email: string
      passwordHash: string
    },
    public readonly metadata: EventMetadata
  ) {}

}
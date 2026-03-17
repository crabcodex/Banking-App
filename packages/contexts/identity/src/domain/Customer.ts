import { CustomerRegistered } from "./events/CustomerRegistered"
import type { EventMetadata } from "@bank/shared"

export class Customer {

  static register(
    customerId: string,
    email: string,
    passwordHash: string,
    metadata: EventMetadata
  ) {

    return [
      new CustomerRegistered(
        customerId,
        { email, passwordHash },
        metadata
      )
    ]

  }

}
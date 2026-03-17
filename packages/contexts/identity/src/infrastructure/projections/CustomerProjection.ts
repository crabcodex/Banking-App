export class CustomerProjection {

  async handle(event: any, db: any) {

    if (event.type !== "CustomerRegistered") {
      return;
    }

    const {
      customerId,
      email,
      status,
      createdAt
    } = event.data;

    await db.query(
      `
      INSERT INTO customer_projection
      (customer_id, email, status, created_at)
      VALUES ($1,$2,$3,$4)
      `,
      [
        customerId,
        email,
        status,
        createdAt
      ]
    );

  }

}
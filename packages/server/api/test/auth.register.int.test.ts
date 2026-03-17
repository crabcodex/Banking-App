import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { setupContainer } from "../src/di/container";
import { CommandBus } from "@bank/shared";

describe("AUTH-01 - Register Customer (Integration)", () => {

  let app: any;

  beforeAll(async () => {
    await setupContainer({
      NODE_ENV: "test" as any,
      PORT: 3001,
      PGLITE_WRITE_DIR: ":memory:",
      PGLITE_READ_DIR: ":memory:"
    } as any);

    const commandBus = new CommandBus();
    app = createApp(commandBus);
  });

  it("should register a customer successfully", async () => {

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@test.com",
        password: "123456"
      });

    expect(res.status).toBe(201);
  });

});
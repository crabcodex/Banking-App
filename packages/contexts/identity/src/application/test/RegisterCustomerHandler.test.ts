import { describe, it, expect, beforeEach, vi } from "vitest";
import { RegisterCustomerHandler } from "../commands/RegisterCustomerHandler";

describe("RegisterCustomerHandler", () => {

  const mockEventStore = {
    appendToStream: vi.fn()
  };

  const mockEventBus = {
    publish: vi.fn()
  };

  const mockArgon2 = {
    hash: vi.fn().mockResolvedValue("hashed-password")
  };

  const mockReadDb = {
    db: {
      select: vi.fn()
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw if email already exists", async () => {

    mockReadDb.db.select.mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [{ email: "test@test.com" }]
        })
      })
    });

    const handler = new RegisterCustomerHandler(
      mockEventStore as any,
      mockEventBus as any,
      mockArgon2 as any,
      mockReadDb as any
    );

    await expect(
      handler.execute({
        email: "test@test.com",
        password: "123456"
      } as any)
    ).rejects.toThrow("Email already exists");

  });

  it("should register customer successfully", async () => {

    mockReadDb.db.select.mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => []
        })
      })
    });

    const handler = new RegisterCustomerHandler(
      mockEventStore as any,
      mockEventBus as any,
      mockArgon2 as any,
      mockReadDb as any
    );

    await handler.execute({
      email: "new@test.com",
      password: "123456"
    } as any);

    expect(mockEventStore.appendToStream).toHaveBeenCalled();
    expect(mockEventBus.publish).toHaveBeenCalled();

  });

});
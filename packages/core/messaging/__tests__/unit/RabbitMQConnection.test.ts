import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RabbitMQConnection } from '../../src/RabbitMQConnection';

const { mockChannel, mockConnection } = vi.hoisted(() => {
  const mockChannel = {
    close: vi.fn().mockResolvedValue(undefined),
    assertExchange: vi.fn().mockResolvedValue(undefined),
    publish: vi.fn().mockReturnValue(true),
    waitForConfirms: vi.fn().mockResolvedValue(undefined),
  };

  const mockConnection = {
    createConfirmChannel: vi.fn().mockResolvedValue(mockChannel),
    close: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  };

  return { mockChannel, mockConnection };
});

vi.mock('amqplib', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(mockConnection),
  },
}));

describe('RabbitMQConnection', () => {
  let connection: RabbitMQConnection;

  beforeEach(() => {
    vi.clearAllMocks();
    connection = new RabbitMQConnection({ url: 'amqp://localhost' });
  });

  it('debe conectarse y crear un ConfirmChannel', async () => {
    await connection.connect();

    expect(connection.isConnected()).toBe(true);
    expect(mockConnection.createConfirmChannel).toHaveBeenCalledOnce();
  });

  it('debe retornar el channel después de conectarse', async () => {
    await connection.connect();

    const channel = connection.getChannel();
    expect(channel).toBe(mockChannel);
  });

  it('debe lanzar error si se accede al channel sin conectar', () => {
    expect(() => connection.getChannel())
      .toThrow('RabbitMQ no conectado');
  });

  it('isConnected() debe retornar false antes de conectar', () => {
    expect(connection.isConnected()).toBe(false);
  });

  it('debe cerrar channel y conexión al llamar close()', async () => {
    await connection.connect();
    await connection.close();

    expect(mockChannel.close).toHaveBeenCalledOnce();
    expect(mockConnection.close).toHaveBeenCalledOnce();
    expect(connection.isConnected()).toBe(false);
  });

  it('debe registrar listeners de close y error en la conexión', async () => {
    await connection.connect();

    expect(mockConnection.on).toHaveBeenCalledWith('close', expect.any(Function));
    expect(mockConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
  });
});

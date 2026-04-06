import amqplib from 'amqplib';
import type { ConfirmChannel } from 'amqplib';

export interface RabbitMQConfig {
  readonly url: string;
  readonly reconnectDelayMs?: number;
  readonly maxReconnectAttempts?: number;
}

/**
 * Gestor de conexión a RabbitMQ con reconexión automática.
 *
 * Usa ConfirmChannel para garantizar publisher confirms:
 * los mensajes no se pierden silenciosamente.
 */
export class RabbitMQConnection {
  private connection: Awaited<ReturnType<typeof amqplib.connect>> | null = null;
  private channel: ConfirmChannel | null = null;
  private reconnecting = false;

  constructor(private readonly config: RabbitMQConfig) {}

  async connect(): Promise<void> {
    this.connection = await amqplib.connect(this.config.url);
    this.channel = await this.connection.createConfirmChannel();

    this.connection.on('close', () => {
      if (!this.reconnecting) void this.handleDisconnect();
    });
    this.connection.on('error', (err: Error) => {
      console.error('[RabbitMQ] Error de conexión:', err.message);
    });
  }

  getChannel(): ConfirmChannel {
    if (!this.channel) {
      throw new Error('RabbitMQ no conectado. Llamar connect() primero.');
    }
    return this.channel;
  }

  isConnected(): boolean {
    return this.channel !== null;
  }

  async close(): Promise<void> {
    this.reconnecting = true;
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } finally {
      this.channel = null;
      this.connection = null;
      this.reconnecting = false;
    }
  }

  private async handleDisconnect(): Promise<void> {
    this.channel = null;
    this.connection = null;
    this.reconnecting = true;

    const maxAttempts = this.config.maxReconnectAttempts ?? 10;
    const baseDelay = this.config.reconnectDelayMs ?? 5_000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const delay = baseDelay * attempt;
      console.log(`[RabbitMQ] Reconectando (intento ${attempt}/${maxAttempts}) en ${delay}ms...`);

      await new Promise((r) => setTimeout(r, delay));

      try {
        await this.connect();
        console.log('[RabbitMQ] Reconexión exitosa');
        this.reconnecting = false;
        return;
      } catch {
        console.error(`[RabbitMQ] Reconexión fallida (intento ${attempt})`);
      }
    }

    this.reconnecting = false;
    console.error('[RabbitMQ] Agotados todos los intentos de reconexión');
  }
}

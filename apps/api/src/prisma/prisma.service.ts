import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to PostgreSQL database successfully.');
    } catch (error) {
      this.logger.warn(
        `Prisma could not connect to database on startup: ${(error as Error).message}. Application will continue in degraded/offline DB mode.`
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from PostgreSQL database.');
  }

  /**
   * Health verification check for PostgreSQL connection
   */
  async checkHealth(): Promise<{ status: 'connected' | 'disconnected'; latencyMs?: number; error?: string }> {
    const startTime = Date.now();
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        status: 'connected',
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        status: 'disconnected',
        error: (err as Error).message,
      };
    }
  }
}


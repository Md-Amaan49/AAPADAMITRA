import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from './dto/health-response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  check(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'aapadamitra-api',
    };
  }

  async checkDatabase() {
    return this.prisma.checkHealth();
  }
}


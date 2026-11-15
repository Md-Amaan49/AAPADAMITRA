import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiProviderClient } from './ai-provider.client';
import { AiHealthService } from './ai-health.service';
import { AiRegistryService } from './ai-registry.service';
import { AiTriggerService } from './ai-trigger.service';
import { AiAuthorizationGuard } from './guards/ai-authorization.guard';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiProviderClient,
    AiHealthService,
    AiRegistryService,
    AiTriggerService,
    AiAuthorizationGuard,
  ],
  exports: [
    AiService,
    AiProviderClient,
    AiHealthService,
    AiRegistryService,
    AiTriggerService,
  ],
})
export class AiModule {}

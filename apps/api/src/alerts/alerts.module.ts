import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController, IncidentsController } from './alerts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlertsController, IncidentsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}


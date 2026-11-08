import { ApiProperty } from '@nestjs/swagger';
import { HealthCheckResponse } from '@aapadamitra/contracts';

export class HealthResponseDto implements HealthCheckResponse {
  @ApiProperty({
    example: 'ok',
    description: 'Current status of the API service',
    enum: ['ok', 'degraded', 'down'],
  })
  status!: 'ok' | 'degraded' | 'down';

  @ApiProperty({
    example: 'aapadamitra-api',
    description: 'Identified name of the service',
  })
  service!: string;
}


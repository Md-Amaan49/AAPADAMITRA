import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'System health check verification' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy and responding',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    return this.healthService.check();
  }
}


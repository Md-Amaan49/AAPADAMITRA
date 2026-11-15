import { Injectable, Logger } from '@nestjs/common';
import { AiProviderClient } from './ai-provider.client';

export interface AiHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  provider_reachable: boolean;
  provider_latency_ms?: number;
  environment?: string;
  uptime_seconds?: number;
  active_hazard?: string;
  models_loaded: {
    cyclone: boolean;
    flood: boolean;
    landslide: boolean;
    tsunami: boolean;
  };
  key_configured: boolean;
  governance_mode: string;
  operational_notice: string;
}

@Injectable()
export class AiHealthService {
  private readonly logger = new Logger(AiHealthService.name);

  constructor(private readonly providerClient: AiProviderClient) {}

  async checkHealth(): Promise<AiHealthStatus> {
    const keyConfigured = this.providerClient.isKeyConfigured();

    try {
      const { data, latencyMs } = await this.providerClient.getHealth();

      const modelsLoaded = {
        cyclone: Boolean(data.cyclone_model_loaded),
        flood: Boolean(data.flood_model_loaded),
        landslide: Boolean(data.landslide_model_loaded),
        tsunami: Boolean(data.tsunami_model_loaded),
      };

      // In the hosted free-tier service, flood, landslide, and tsunami models are lazy-loaded or run in demo mode.
      const isDegraded = !keyConfigured || !modelsLoaded.cyclone;

      return {
        status: isDegraded ? 'DEGRADED' : 'HEALTHY',
        provider_reachable: true,
        provider_latency_ms: latencyMs,
        environment: data.environment,
        uptime_seconds: data.uptime_seconds,
        active_hazard: data.active_hazard,
        models_loaded: modelsLoaded,
        key_configured: keyConfigured,
        governance_mode: 'MULTI_HAZARD_GOVERNED_RESEARCH_PILOT',
        operational_notice:
          'Provider health verifies HTTP reachability only. It does NOT constitute statutory authorization to issue warnings or proof of real-time input freshness.',
      };
    } catch (err: any) {
      this.logger.warn(`AI Provider health check failed: ${err.message}`);
      return {
        status: 'UNAVAILABLE',
        provider_reachable: false,
        key_configured: keyConfigured,
        models_loaded: {
          cyclone: false,
          flood: false,
          landslide: false,
          tsunami: false,
        },
        governance_mode: 'MULTI_HAZARD_GOVERNED_RESEARCH_PILOT',
        operational_notice: `Hosted model API is unreachable at ${this.providerClient.getBaseUrl()}. Service may be cold-starting on Render free tier.`,
      };
    }
  }
}

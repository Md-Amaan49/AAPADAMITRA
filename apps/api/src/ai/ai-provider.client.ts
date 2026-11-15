import {
  Injectable,
  Logger,
  BadGatewayException,
  GatewayTimeoutException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HostedProviderHealthResponse,
  HostedModelsRegistryResponse,
  HostedHazardsCatalogResponse,
  HostedModelInfoResponse,
  HostedCycloneResponse,
  HostedFloodResponse,
  HostedLandslideResponse,
  HostedTsunamiResponse,
} from './interfaces/provider-contracts.interface';
import { HazardTypeKey } from './constants/ai-governance.constants';

@Injectable()
export class AiProviderClient {
  private readonly logger = new Logger(AiProviderClient.name);
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .get<string>('AI_MODEL_API_BASE_URL', 'https://aapadamitra-model-api.onrender.com')
      .replace(/\/+$/, '');
    this.apiKey = this.configService.get<string>('AI_MODEL_API_KEY');
    this.timeoutMs = Number(this.configService.get<number>('AI_MODEL_API_TIMEOUT_MS', 15000));

    this.logger.log(`Initialized AiProviderClient with Base URL: ${this.baseUrl}, Timeout: ${this.timeoutMs}ms`);
    if (!this.apiKey) {
      this.logger.warn('AI_MODEL_API_KEY is not set or empty. Protected predictions will be blocked pending key rotation.');
    }
  }

  public isKeyConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Public endpoint: Health check. Does NOT send API Key.
   */
  async getHealth(): Promise<{ data: HostedProviderHealthResponse; latencyMs: number }> {
    return this.executeRequest<HostedProviderHealthResponse>('/health', {
      method: 'GET',
      includeApiKey: false,
    });
  }

  /**
   * Public endpoint: Models registry. Does NOT send API Key.
   */
  async getModels(): Promise<{ data: HostedModelsRegistryResponse; latencyMs: number }> {
    return this.executeRequest<HostedModelsRegistryResponse>('/models', {
      method: 'GET',
      includeApiKey: false,
    });
  }

  /**
   * Public endpoint: Hazards catalog. Does NOT send API Key.
   */
  async getHazards(): Promise<{ data: HostedHazardsCatalogResponse; latencyMs: number }> {
    return this.executeRequest<HostedHazardsCatalogResponse>('/api/v1/hazards', {
      method: 'GET',
      includeApiKey: false,
    });
  }

  /**
   * Public endpoint: Specific model info. Does NOT send API Key.
   */
  async getModelInfo(hazard: HazardTypeKey): Promise<{ data: HostedModelInfoResponse; latencyMs: number }> {
    return this.executeRequest<HostedModelInfoResponse>(`/api/v1/${hazard}/model-info`, {
      method: 'GET',
      includeApiKey: false,
    });
  }

  /**
   * Protected endpoint: Predict Cyclone. Sends X-API-Key.
   */
  async predictCyclone(payload: any): Promise<{ data: HostedCycloneResponse; latencyMs: number }> {
    return this.executeRequest<HostedCycloneResponse>('/api/v1/cyclone/predict', {
      method: 'POST',
      body: payload,
      includeApiKey: true,
    });
  }

  /**
   * Protected endpoint: Predict Flood. Sends X-API-Key.
   */
  async predictFlood(payload: any): Promise<{ data: HostedFloodResponse; latencyMs: number }> {
    return this.executeRequest<HostedFloodResponse>('/api/v1/flood/predict', {
      method: 'POST',
      body: payload,
      includeApiKey: true,
    });
  }

  /**
   * Protected endpoint: Predict Landslide. Sends X-API-Key.
   */
  async predictLandslide(payload: any): Promise<{ data: HostedLandslideResponse; latencyMs: number }> {
    return this.executeRequest<HostedLandslideResponse>('/api/v1/landslide/predict', {
      method: 'POST',
      body: payload,
      includeApiKey: true,
    });
  }

  /**
   * Protected endpoint: Predict Tsunami. Sends X-API-Key.
   */
  async predictTsunami(payload: any): Promise<{ data: HostedTsunamiResponse; latencyMs: number }> {
    return this.executeRequest<HostedTsunamiResponse>('/api/v1/tsunami/predict', {
      method: 'POST',
      body: payload,
      includeApiKey: true,
    });
  }

  /**
   * Core HTTP request dispatcher with bounded timeout, credential protection,
   * safe error mapping, and timing.
   */
  private async executeRequest<T>(
    endpoint: string,
    options: {
      method: 'GET' | 'POST';
      body?: any;
      includeApiKey?: boolean;
    }
  ): Promise<{ data: T; latencyMs: number }> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (options.includeApiKey) {
      if (!this.apiKey || this.apiKey.trim().length === 0) {
        throw new UnauthorizedException(
          'Protected prediction call blocked: AI_MODEL_API_KEY is not configured or pending rotation.'
        );
      }
      headers['X-API-Key'] = this.apiKey;
    }

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const startTime = Date.now();
    try {
      const response = await fetch(fullUrl, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const status = response.status;
        let responseBodyText = '';
        try {
          responseBodyText = await response.text();
        } catch {
          responseBodyText = 'Unable to read error body';
        }

        // Safe error logging: NEVER log headers or apiKey
        this.logger.error(
          `AI Provider error on [${options.method}] ${endpoint}: HTTP ${status} (Latency: ${latencyMs}ms)`
        );

        if (status === 401 || status === 403) {
          throw new UnauthorizedException(
            'Hosted AI Model API rejected credentials. Ensure rotated AI_MODEL_API_KEY is configured.'
          );
        }

        if (status === 422) {
          throw new BadGatewayException({
            message: 'Hosted AI Model API validation rejected input payload.',
            providerStatus: 422,
            providerError: responseBodyText,
          });
        }

        if (status >= 500) {
          throw new BadGatewayException(
            `Hosted AI Model API returned server error (HTTP ${status}). Service may be cold-starting or unavailable.`
          );
        }

        throw new BadGatewayException(
          `Hosted AI Model API request failed with HTTP status ${status}.`
        );
      }

      const data = (await response.json()) as T;
      return { data, latencyMs };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;

      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        this.logger.error(`AI Provider timeout on ${endpoint} after ${this.timeoutMs}ms`);
        throw new GatewayTimeoutException(
          `Hosted AI Model API timed out after ${this.timeoutMs}ms. The instance may be waking from Render sleep.`
        );
      }

      if (
        err instanceof UnauthorizedException ||
        err instanceof BadGatewayException ||
        err instanceof GatewayTimeoutException
      ) {
        throw err;
      }

      this.logger.error(`AI Provider connection failure on ${endpoint}: ${err.message}`);
      throw new BadGatewayException(
        `Unable to reach Hosted AI Model API at ${this.baseUrl}: ${err.message}`
      );
    }
  }
}

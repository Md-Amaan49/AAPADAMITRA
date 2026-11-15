import { Injectable, Logger } from '@nestjs/common';
import { AiProviderClient } from './ai-provider.client';
import {
  HazardTypeKey,
  STATUTORY_AUTHORITIES,
  SCIENTIFIC_CAVEATS,
  ModelPromotionStatus,
} from './constants/ai-governance.constants';
import {
  HostedModelsRegistryResponse,
  HostedHazardsCatalogResponse,
  HostedModelInfoResponse,
} from './interfaces/provider-contracts.interface';

@Injectable()
export class AiRegistryService {
  private readonly logger = new Logger(AiRegistryService.name);

  constructor(private readonly providerClient: AiProviderClient) {}

  /**
   * Retrieves models registry with transparent audit reconciliation.
   */
  async getModels(): Promise<{
    registry: HostedModelsRegistryResponse;
    governance_audit: {
      promoted_hazard: string;
      demonstration_hazards: string[];
      registry_discrepancy_detected: boolean;
      discrepancy_explanation: string;
    };
  }> {
    const { data } = await this.providerClient.getModels();

    const discrepancy =
      data.active_hazard_count === 1 && data.demonstration_hazard_count === 4;

    return {
      registry: data,
      governance_audit: {
        promoted_hazard: HazardTypeKey.CYCLONE,
        demonstration_hazards: [
          HazardTypeKey.FLOOD,
          HazardTypeKey.LANDSLIDE,
          HazardTypeKey.TSUNAMI,
        ],
        registry_discrepancy_detected: discrepancy,
        discrepancy_explanation:
          'Audit Note: Hosted API reports demonstration_hazard_count=4 while active_hazard_count=1 because demo_enabled is true for all models. Under AAPADAMITRA governance, Cyclone v3.0 is the sole production-promoted model, while Flood, Landslide, and Tsunami are strictly demonstration models.',
      },
    };
  }

  /**
   * Retrieves hazard catalog with enriched statutory notices.
   */
  async getHazards(): Promise<{
    catalog: HostedHazardsCatalogResponse;
    statutory_authorities: typeof STATUTORY_AUTHORITIES;
  }> {
    const { data } = await this.providerClient.getHazards();

    return {
      catalog: data,
      statutory_authorities: STATUTORY_AUTHORITIES,
    };
  }

  /**
   * Retrieves individual hazard model information with statutory disclaimer and caveats.
   */
  async getModelInfo(hazard: HazardTypeKey): Promise<{
    info: HostedModelInfoResponse;
    statutory_authority: (typeof STATUTORY_AUTHORITIES)[HazardTypeKey];
    scientific_caveat: string;
    is_demonstration_only: boolean;
  }> {
    const { data } = await this.providerClient.getModelInfo(hazard);

    const isDemo = data.production_status !== ModelPromotionStatus.PROMOTED;

    return {
      info: data,
      statutory_authority: STATUTORY_AUTHORITIES[hazard],
      scientific_caveat: SCIENTIFIC_CAVEATS[hazard] || 'No specific caveat recorded.',
      is_demonstration_only: isDemo,
    };
  }
}

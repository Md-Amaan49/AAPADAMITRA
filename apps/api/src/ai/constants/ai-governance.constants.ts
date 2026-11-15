/**
 * AAPADAMITRA — AI Model Governance & Safety Constants
 * Implements strict scientific governance and statutory boundaries.
 */

export enum HazardTypeKey {
  CYCLONE = 'cyclone',
  FLOOD = 'flood',
  LANDSLIDE = 'landslide',
  TSUNAMI = 'tsunami',
}

export enum PredictionTriggerType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

export enum ModelExecutionTier {
  PRODUCTION = 'PRODUCTION',
  DEMONSTRATION = 'DEMONSTRATION',
}

export enum ModelPromotionStatus {
  PROMOTED = 'PROMOTED TO PRODUCTION',
  NOT_PROMOTED = 'NOT PROMOTED',
}

export enum DemonstrationStatus {
  PRODUCTION_APPROVED = 'PRODUCTION_APPROVED',
  DEMONSTRATION_ONLY = 'DEMONSTRATION_ONLY',
  DEMONSTRATION_ACTIVE = 'DEMONSTRATION_ACTIVE',
}

export interface StatutoryAuthorityMetadata {
  hazard: HazardTypeKey;
  authorityName: string;
  officialMandate: string;
  warningNotice: string;
}

export const STATUTORY_AUTHORITIES: Record<HazardTypeKey, StatutoryAuthorityMetadata> = {
  [HazardTypeKey.CYCLONE]: {
    hazard: HazardTypeKey.CYCLONE,
    authorityName: 'India Meteorological Department (IMD) - RSMC New Delhi',
    officialMandate: 'Sole statutory authority for tropical cyclone advisories, track bulletins, and storm surge warnings in the North Indian Ocean.',
    warningNotice: 'Official cyclone warnings and landfalls are governed exclusively by IMD RSMC New Delhi. AAPADAMITRA model outputs are decision-support aids only.',
  },
  [HazardTypeKey.FLOOD]: {
    hazard: HazardTypeKey.FLOOD,
    authorityName: 'Central Water Commission (CWC) / National Water Informatics Centre (NWIC)',
    officialMandate: 'Sole statutory authority for river stage forecasts and official flood alerts in Indian river basins.',
    warningNotice: 'Official river flood alerts and reservoir advisories are governed statutorily by CWC. AAPADAMITRA river discharge forecasts do NOT replace CWC bulletins.',
  },
  [HazardTypeKey.LANDSLIDE]: {
    hazard: HazardTypeKey.LANDSLIDE,
    authorityName: 'Geological Survey of India (GSI)',
    officialMandate: 'National nodal agency for landslide hazard susceptibility mapping and slope-stability advisories.',
    warningNotice: 'Statutory landslide early warnings in India are governed exclusively by GSI. AAPADAMITRA susceptibility screening is an experimental research decision-aid.',
  },
  [HazardTypeKey.TSUNAMI]: {
    hazard: HazardTypeKey.TSUNAMI,
    authorityName: 'Indian National Centre for Ocean Information Services (INCOIS) - ITEWC',
    officialMandate: 'Sole national and regional authority for tsunami early warning in the Indian Ocean basin.',
    warningNotice: 'Official tsunami watches, warnings, and coastal alerts are governed exclusively by INCOIS - ITEWC. Do NOT use this model for operational coastal evacuation.',
  },
};

export const SCIENTIFIC_CAVEATS: Record<HazardTypeKey, string> = {
  [HazardTypeKey.CYCLONE]:
    'Official cyclone warnings are governed statutorily by IMD RSMC New Delhi. Extratropical transitioning storms or asymmetric landfall shearing exhibit higher track error. Rapid intensification can be triggered by mesoscale convective bursts below 6-hour temporal sampling.',
  [HazardTypeKey.FLOOD]:
    'DEMONSTRATION ONLY: River basin gauging station discharge forecast (+24h). Upstream dam reservoir gate operations and emergency releases are unobserved in telemetry. Candidate Random Forest model (NSE 0.9189) did NOT outperform the operational 1-day persistence benchmark (0.9229). Extreme flash flood surges (>99th percentile) may show localized underestimation.',
  [HazardTypeKey.LANDSLIDE]:
    'DEMONSTRATION ONLY: Terrain morphometry and hydrometeorological landslide susceptibility screening. Independent audit identified that the 1.0 PR-AUC is an artifact of synthetic non-landslide background sampling. Static DEM does not capture micro-topographic road cuts, quarrying, or slope toe excavation. Sub-daily cloudbursts (<1 hour) may trigger shallow slips unobserved in reanalysis.',
  [HazardTypeKey.TSUNAMI]:
    'DEMONSTRATION ONLY: Seismic hypocenter and bathymetric tsunami potential early screening. Candidate Random Forest model achieved PR-AUC 0.6500, lower than the pre-existing baseline (0.6845). Point-source hypocentral parameters do not capture fault geometry, focal mechanism (strike/dip/rake), or dynamic seafloor rupture displacement. Modern major tsunami sample size in the Indian Ocean is statistically very small.',
};

/**
 * Non-negotiable safety guardrails:
 * AAPADAMITRA models NEVER autonomously trigger public warnings,
 * evacuation orders, or critical infrastructure actuation.
 */
export const CRITICAL_SAFETY_BOUNDARIES = {
  ALLOW_AUTONOMOUS_PUBLIC_ALERTS: false,
  ALLOW_AUTONOMOUS_EVACUATION_ORDERS: false,
  ALLOW_AUTONOMOUS_DAM_GATE_CONTROL: false,
  MANDATORY_HUMAN_IN_THE_LOOP_APPROVAL: true,
};

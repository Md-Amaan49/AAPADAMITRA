export enum HazardType {
  FLOOD = 'FLOOD',
  CYCLONE = 'CYCLONE',
  EARTHQUAKE = 'EARTHQUAKE',
  LANDSLIDE = 'LANDSLIDE',
  DROUGHT = 'DROUGHT',
  INDUSTRIAL = 'INDUSTRIAL',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WATCH = 'WATCH',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  CRITICAL = 'CRITICAL',
}

export interface HazardIncidentSummary {
  id: string;
  type: HazardType;
  severity: AlertSeverity;
  title: string;
  region: string;
  createdAt: string;
}


import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  CreateAlertDto,
  ApproveAlertDto,
  RejectAlertDto,
  CreateIncidentReportDto,
  RespondIncidentDto,
} from './dto/alert.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface DisasterAlert {
  id: string;
  hazardType: string;
  severity: string;
  title: string;
  summary: string;
  district: string;
  affectedAreas: string[];
  sourceType: string;
  sourceDetails: string;
  confidenceScore?: number;
  status: 'PENDING_APPROVAL' | 'ACTIVE_BROADCAST' | 'REJECTED' | 'EXPIRED';
  approvedBy?: string;
  createdAt: string;
  onsetAt: string;
  expiresAt: string;
  durationHours: number;
  evacuationRoutes?: string[];
  safeShelters?: string[];
}

export interface CitizenReport {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  district: string;
  locality: string;
  hazardType: string;
  description: string;
  urgency: string;
  status: 'SUBMITTED' | 'INSPECTION_DISPATCHED' | 'ACTION_TAKEN' | 'RESOLVED' | 'ARCHIVED';
  createdAt: string;
  authorityResponse?: {
    respondedBy: string;
    respondedAt: string;
    message: string;
    actionTaken: string;
  };
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  private alerts: Map<string, DisasterAlert> = new Map();
  private reports: Map<string, CitizenReport> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.seedInitialOperationalData();
  }

  private seedInitialOperationalData() {
    const now = new Date();

    // 1. Pre-seed Active Alerts for Nanded (Vishnupuri Dam pilot)
    const nandedAlertId = 'ALT-NAN-2026-001';
    const nandedOnset = new Date(now.getTime() + 45 * 60 * 1000); // 45 minutes from now
    const nandedExpires = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now

    this.alerts.set(nandedAlertId, {
      id: nandedAlertId,
      hazardType: 'FLOOD',
      severity: 'WARNING',
      title: 'Vishnupuri Dam Controlled Release & Riverbank Inundation Warning',
      summary: '4 radial gates opened to 1.2m discharging 24,500 cusecs into Godavari River. Riverbank low-lying zones to experience submersion within 45 minutes.',
      district: 'Nanded',
      affectedAreas: ['Sangvi', 'Degaon', 'Vishnupuri Ghat', 'Khadkpura'],
      sourceType: 'TELEMETRY_AND_MODEL',
      sourceDetails: 'CWC Hydrological Gauge Station & Vishnupuri Inflow Surge Model v2.1',
      confidenceScore: 92.4,
      status: 'ACTIVE_BROADCAST',
      approvedBy: 'District Collector & Chairman DDMA, Nanded',
      createdAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      onsetAt: nandedOnset.toISOString(),
      expiresAt: nandedExpires.toISOString(),
      durationHours: 6,
      evacuationRoutes: ['Degaon-Malegaon Bypass Road', 'National Highway 161 High Ground'],
      safeShelters: ['Government Polytechnic College Camp, Nanded', 'Municipal School #4 Old Nanded'],
    });

    // 2. Pre-seed Active Alerts for Mumbai (Coastal & Urban Flood)
    const mumbaiAlertId = 'ALT-MUM-2026-001';
    const mumbaiOnset = new Date(now.getTime() + 90 * 60 * 1000); // 1.5 hours from now
    const mumbaiExpires = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours from now

    this.alerts.set(mumbaiAlertId, {
      id: mumbaiAlertId,
      hazardType: 'CYCLONE',
      severity: 'WATCH',
      title: 'Arabian Sea High Tide & Coastal Gale Surge Watch',
      summary: 'Spring tide of 4.65 meters coinciding with 55 km/h gusty southwest winds. Wave overtopping projected along Western Coastal belt.',
      district: 'Mumbai',
      affectedAreas: ['Worli Seaface', 'Dadar Chowpatty', 'Bandra Bandstand', 'Versova Beach'],
      sourceType: 'AI_MODEL',
      sourceDetails: 'IMD Coastal Doppler Radar & Arabian Sea Surge ML Model v1.8',
      confidenceScore: 89.0,
      status: 'ACTIVE_BROADCAST',
      approvedBy: 'Municipal Commissioner & DDMA Mumbai Desk',
      createdAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      onsetAt: mumbaiOnset.toISOString(),
      expiresAt: mumbaiExpires.toISOString(),
      durationHours: 8,
      evacuationRoutes: ['Senapati Bapat Marg Elevated Corridor', 'Western Express Highway'],
      safeShelters: ['Bandra Municipal Community Centre', 'Dadar Girls High School Hall'],
    });

    // 3. Pre-seed Pending AI Predictions for Authority Review (Nanded & Mumbai)
    const pendingNandedId = 'ALT-NAN-2026-DRAFT-082';
    this.alerts.set(pendingNandedId, {
      id: pendingNandedId,
      hazardType: 'FLOOD',
      severity: 'CRITICAL_EVACUATION',
      title: 'AI Prediction: Upstream Godavari Catchment Surge (55,000 cusecs)',
      summary: 'Extreme rainfall detected in upper catchment (Mudkhed & Biloli). Hydraulic simulation predicts water level reaching 354.80m (FRL: 355.00m) in 3 hours. Additional 6 gates recommended for opening.',
      district: 'Nanded',
      affectedAreas: ['Biloli Tehsil', 'Mukhed Riverside', 'Sangvi Village'],
      sourceType: 'AI_MODEL',
      sourceDetails: 'AAPADAMITRA Hydro-Inundation Neural Model v2.4 (Promoted to Production)',
      confidenceScore: 94.2,
      status: 'PENDING_APPROVAL',
      createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      onsetAt: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
      durationHours: 12,
    });

    const pendingMumbaiId = 'ALT-MUM-2026-DRAFT-083';
    this.alerts.set(pendingMumbaiId, {
      id: pendingMumbaiId,
      hazardType: 'FLOOD',
      severity: 'WARNING',
      title: 'AI Prediction: Mithi River Catchment Flash Inundation',
      summary: 'Radar rainfall rate > 65mm/hr. Low-lying areas along Kranti Nagar and Kurla projected for 2.0-foot street waterlogging within 2 hours.',
      district: 'Mumbai',
      affectedAreas: ['Kurla West', 'Kranti Nagar', 'Bail Bazar'],
      sourceType: 'AI_MODEL',
      sourceDetails: 'Urban Runoff Hydrodynamic Model v1.4',
      confidenceScore: 87.6,
      status: 'PENDING_APPROVAL',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      onsetAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      durationHours: 6,
    });

    // 4. Pre-seed Citizen Reports with Authority Two-Way Feedback
    const reportNandedId = 'REP-NAN-2026-101';
    this.reports.set(reportNandedId, {
      id: reportNandedId,
      citizenId: 'usr-citi-00000000-0000-0000-0000-000000000004',
      citizenName: 'Pooja Deshmukh',
      citizenPhone: '9800000004',
      district: 'Nanded',
      locality: 'Sangvi Ghat Causeway, Godavari riverside',
      hazardType: 'WATERLOGGING',
      description: 'Water has crested 1.5 feet over the village causeway. 3 elderly citizens unable to cross to main road.',
      urgency: 'HIGH',
      status: 'INSPECTION_DISPATCHED',
      createdAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
      authorityResponse: {
        respondedBy: 'DEOC Officer In-Charge (Nanded)',
        respondedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        message: 'SDRF Boat Unit #2 dispatched from Vishnupuri base. Rescue personnel approaching causeway with life jackets.',
        actionTaken: 'DISPATCH_RESCUE_TEAM',
      },
    });

    const reportMumbaiId = 'REP-MUM-2026-102';
    this.reports.set(reportMumbaiId, {
      id: reportMumbaiId,
      citizenId: 'usr-citi-00000000-0000-0000-0000-000000000004',
      citizenName: 'Pooja Deshmukh',
      citizenPhone: '9800000004',
      district: 'Mumbai',
      locality: 'Milan Subway, Santacruz West',
      hazardType: 'WATERLOGGING',
      description: 'Underpass flooded up to knee depth. Two cars stalled and traffic immobilized.',
      urgency: 'STANDARD',
      status: 'ACTION_TAKEN',
      createdAt: new Date(now.getTime() - 50 * 60 * 1000).toISOString(),
      authorityResponse: {
        respondedBy: 'BMC Disaster Control Desk, Mumbai',
        respondedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        message: 'High-capacity dewatering pumps turned on. Traffic Police diverting vehicles to SV Road flyover.',
        actionTaken: 'ACTIVATE_PUMPS_AND_DIVERSION',
      },
    });

    this.logger.log(`Initialized ${this.alerts.size} alerts and ${this.reports.size} citizen incident reports.`);
  }

  /**
   * Get Active Broadcast Alerts filtered by District (with automatic expiration check)
   */
  async getActiveAlerts(district?: string): Promise<DisasterAlert[]> {
    const now = new Date();
    const result: DisasterAlert[] = [];

    for (const alert of this.alerts.values()) {
      // Auto-expire alerts past expiresAt
      if (alert.status === 'ACTIVE_BROADCAST' && new Date(alert.expiresAt) < now) {
        alert.status = 'EXPIRED';
        continue;
      }

      if (alert.status !== 'ACTIVE_BROADCAST') {
        continue;
      }

      // Geo-filtering: match district if specified (case-insensitive) or return all if district is 'All' or omitted
      if (!district || district.toLowerCase() === 'all') {
        result.push(alert);
      } else {
        const queryDist = district.toLowerCase().trim();
        const alertDist = alert.district.toLowerCase().trim();
        if (alertDist.includes(queryDist) || queryDist.includes(alertDist)) {
          result.push(alert);
        }
      }
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get Pending Alerts for District Authority Review (HITL)
   */
  async getPendingAlerts(district?: string): Promise<DisasterAlert[]> {
    const result: DisasterAlert[] = [];

    for (const alert of this.alerts.values()) {
      if (alert.status !== 'PENDING_APPROVAL') continue;

      if (!district || district.toLowerCase() === 'all') {
        result.push(alert);
      } else {
        const queryDist = district.toLowerCase().trim();
        const alertDist = alert.district.toLowerCase().trim();
        if (alertDist.includes(queryDist) || queryDist.includes(alertDist)) {
          result.push(alert);
        }
      }
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Approve Alert Proposal (Authority HITL Action)
   */
  async approveAlert(id: string, dto: ApproveAlertDto, user?: any): Promise<DisasterAlert> {
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new NotFoundException(`Alert proposal ${id} not found.`);
    }

    const now = new Date();
    const durationHours = dto.durationHours || alert.durationHours || 6;
    const onsetMinutes = dto.onsetMinutes || 30;

    const onsetAt = new Date(now.getTime() + onsetMinutes * 60 * 1000);
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    alert.status = 'ACTIVE_BROADCAST';
    alert.approvedBy = dto.approvedBy || user?.fullName || 'District Disaster Management Authority';
    alert.onsetAt = onsetAt.toISOString();
    alert.expiresAt = expiresAt.toISOString();
    alert.durationHours = durationHours;

    if (dto.customAdvisory) {
      alert.summary = `${alert.summary} Authority Directive: ${dto.customAdvisory}`;
    }

    this.logger.log(`Alert ${id} approved for broadcast in district ${alert.district} by ${alert.approvedBy}.`);
    return alert;
  }

  /**
   * Reject Alert Proposal
   */
  async rejectAlert(id: string, dto: RejectAlertDto): Promise<{ message: string; alertId: string }> {
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new NotFoundException(`Alert proposal ${id} not found.`);
    }

    alert.status = 'REJECTED';
    this.logger.log(`Alert ${id} rejected. Reason: ${dto.reason || 'Not specified'}`);
    return { message: 'Alert proposal rejected and archived.', alertId: id };
  }

  /**
   * Create an Alert Proposal (from AI Model or Operator)
   */
  async createAlertProposal(dto: CreateAlertDto): Promise<DisasterAlert> {
    const id = `ALT-${dto.district.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const durationHours = dto.durationHours || 6;
    const onsetMinutes = dto.onsetMinutes || 45;

    const newAlert: DisasterAlert = {
      id,
      hazardType: dto.hazardType,
      severity: dto.severity,
      title: dto.title,
      summary: dto.summary,
      district: dto.district,
      affectedAreas: dto.affectedAreas,
      sourceType: dto.sourceType || 'AI_MODEL',
      sourceDetails: 'AI Multi-Hazard Prediction Engine',
      confidenceScore: dto.confidenceScore,
      status: 'PENDING_APPROVAL',
      createdAt: now.toISOString(),
      onsetAt: new Date(now.getTime() + onsetMinutes * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString(),
      durationHours,
    };

    this.alerts.set(id, newAlert);
    return newAlert;
  }

  /**
   * Citizen Reports a Local Hazard / Ground Incident
   */
  async reportIncident(dto: CreateIncidentReportDto, user?: any): Promise<CitizenReport> {
    const id = `REP-${dto.district.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;
    const now = new Date();

    const report: CitizenReport = {
      id,
      citizenId: user?.id || user?.sub || 'usr-citi-guest',
      citizenName: dto.citizenName || user?.fullName || 'Anonymous Citizen',
      citizenPhone: dto.citizenPhone || user?.phone || 'Not Provided',
      district: dto.district,
      locality: dto.locality,
      hazardType: dto.hazardType,
      description: dto.description,
      urgency: dto.urgency || 'STANDARD',
      status: 'SUBMITTED',
      createdAt: now.toISOString(),
    };

    this.reports.set(id, report);
    this.logger.log(`Citizen incident report ${id} logged for district ${dto.district}`);
    return report;
  }

  /**
   * Citizen Fetches their Submitted Reports & Authority Responses
   */
  async getMyReports(phone?: string, citizenId?: string): Promise<CitizenReport[]> {
    const list: CitizenReport[] = [];

    for (const rep of this.reports.values()) {
      if ((citizenId && rep.citizenId === citizenId) || (phone && rep.citizenPhone === phone)) {
        list.push(rep);
      }
    }

    // If empty in dev session, return seeded reports so user sees how response feedback looks!
    if (list.length === 0) {
      for (const rep of this.reports.values()) {
        list.push(rep);
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Authority / Responder Fetches All Incident Reports in their District
   */
  async getDistrictIncidents(district?: string): Promise<CitizenReport[]> {
    const list: CitizenReport[] = [];

    for (const rep of this.reports.values()) {
      if (!district || district.toLowerCase() === 'all') {
        list.push(rep);
      } else {
        const queryDist = district.toLowerCase().trim();
        const repDist = rep.district.toLowerCase().trim();
        if (repDist.includes(queryDist) || queryDist.includes(repDist)) {
          list.push(rep);
        }
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Authority Responds Directly to a Citizen Incident Report
   */
  async respondToIncident(
    incidentId: string,
    dto: RespondIncidentDto,
    user?: any
  ): Promise<CitizenReport> {
    const report = this.reports.get(incidentId);
    if (!report) {
      throw new NotFoundException(`Incident report ${incidentId} not found.`);
    }

    const now = new Date();
    report.status = (dto.newStatus as any) || 'INSPECTION_DISPATCHED';
    report.authorityResponse = {
      respondedBy: dto.responderName || user?.fullName || 'DDMA Emergency Desk',
      respondedAt: now.toISOString(),
      message: dto.message,
      actionTaken: dto.actionTaken,
    };

    this.logger.log(`Authority responded to citizen report ${incidentId}: "${dto.message}"`);
    return report;
  }
}


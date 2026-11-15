const { describe, it } = require('node:test');
const assert = require('node:assert');
const { AlertsService } = require('../dist/alerts/alerts.service');

describe('Disaster Alerts & Geo-Targeting Suite', () => {
  const mockPrisma = {
    checkHealth: async () => ({ status: 'connected' }),
  };

  const service = new AlertsService(mockPrisma);

  describe('District Geo-Filtering', () => {
    it('returns only Nanded alerts when district=Nanded is queried', async () => {
      const alerts = await service.getActiveAlerts('Nanded');
      assert.ok(alerts.length >= 1, 'Should return at least one active Nanded alert');
      for (const a of alerts) {
        assert.strictEqual(a.district, 'Nanded');
        assert.strictEqual(a.status, 'ACTIVE_BROADCAST');
      }
    });

    it('returns only Mumbai alerts when district=Mumbai is queried', async () => {
      const alerts = await service.getActiveAlerts('Mumbai');
      assert.ok(alerts.length >= 1, 'Should return at least one active Mumbai alert');
      for (const a of alerts) {
        assert.strictEqual(a.district, 'Mumbai');
        assert.strictEqual(a.status, 'ACTIVE_BROADCAST');
      }
    });

    it('returns both Nanded and Mumbai alerts when district is All or omitted', async () => {
      const allAlerts = await service.getActiveAlerts();
      const districts = allAlerts.map((a) => a.district);
      assert.ok(districts.includes('Nanded'), 'Should include Nanded in pan-district view');
      assert.ok(districts.includes('Mumbai'), 'Should include Mumbai in pan-district view');
    });
  });

  describe('Authority Human-In-The-Loop Approval & Expiration', () => {
    it('approves a pending prediction alert, setting active status and countdown timestamps', async () => {
      const pendingList = await service.getPendingAlerts('Nanded');
      assert.ok(pendingList.length >= 1, 'Must have a pending draft to approve');
      const draftId = pendingList[0].id;

      const approved = await service.approveAlert(draftId, {
        durationHours: 4,
        onsetMinutes: 30,
        approvedBy: 'District Collector Nanded',
        customAdvisory: 'Evacuate riverbank wards immediately.',
      });

      assert.strictEqual(approved.status, 'ACTIVE_BROADCAST');
      assert.strictEqual(approved.approvedBy, 'District Collector Nanded');
      assert.ok(new Date(approved.expiresAt) > new Date(), 'Expiration must be in future');
      assert.ok(new Date(approved.onsetAt) > new Date(), 'Onset must be in future');
      assert.ok(approved.summary.includes('Evacuate riverbank wards immediately.'));
    });

    it('rejects an alert proposal and marks it as REJECTED', async () => {
      const newProposal = await service.createAlertProposal({
        hazardType: 'CYCLONE',
        severity: 'WATCH',
        title: 'Draft Cyclone Watch',
        summary: 'Approaching depression',
        district: 'Ratnagiri',
        affectedAreas: ['Guhagar', 'Dapoli'],
      });

      const res = await service.rejectAlert(newProposal.id, {
        reason: 'IMD track changed northward.',
      });
      assert.strictEqual(res.alertId, newProposal.id);

      const active = await service.getActiveAlerts('Ratnagiri');
      assert.strictEqual(active.some((a) => a.id === newProposal.id), false, 'Rejected alert must not be active');
    });
  });

  describe('Citizen Incident Reporting & Two-Way Authority Feedback Loop', () => {
    let createdReportId;

    it('allows a citizen to report a ground emergency with district tagging', async () => {
      const report = await service.reportIncident({
        district: 'Mumbai',
        locality: 'Dadar TT Circle',
        hazardType: 'WATERLOGGING',
        description: 'Water accumulation of 2 feet near flyover pier.',
        urgency: 'HIGH',
        citizenName: 'Kunal Deshmukh',
        citizenPhone: '9820011223',
      });

      assert.ok(report.id);
      assert.strictEqual(report.district, 'Mumbai');
      assert.strictEqual(report.status, 'SUBMITTED');
      createdReportId = report.id;
    });

    it('retrieves reports for a citizen with my-reports', async () => {
      const reports = await service.getMyReports('9820011223');
      assert.ok(reports.length >= 1);
    });

    it('allows authority to respond directly to the citizen with official dispatch message', async () => {
      const response = await service.respondToIncident(createdReportId, {
        message: 'BMC Ward G-North dispatched dewatering truck #4.',
        actionTaken: 'DISPATCH_PUMP_TRUCK',
        newStatus: 'INSPECTION_DISPATCHED',
        responderName: 'Control Officer Khan',
      });

      assert.strictEqual(response.status, 'INSPECTION_DISPATCHED');
      assert.ok(response.authorityResponse);
      assert.strictEqual(response.authorityResponse.message, 'BMC Ward G-North dispatched dewatering truck #4.');
      assert.strictEqual(response.authorityResponse.respondedBy, 'Control Officer Khan');
    });
  });
});


const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  HazardTypeKey,
  STATUTORY_AUTHORITIES,
  SCIENTIFIC_CAVEATS,
  CRITICAL_SAFETY_BOUNDARIES,
} = require('../dist/ai/constants/ai-governance.constants');
const { AiTriggerService } = require('../dist/ai/ai-trigger.service');
const { AiAuthorizationGuard, AUTHORIZED_AI_ROLES } = require('../dist/ai/guards/ai-authorization.guard');

describe('AI Governance & Safety Guardrails Suite', () => {
  it('enforces that autonomous public warnings and evacuations are strictly forbidden', () => {
    assert.strictEqual(CRITICAL_SAFETY_BOUNDARIES.ALLOW_AUTONOMOUS_PUBLIC_ALERTS, false);
    assert.strictEqual(CRITICAL_SAFETY_BOUNDARIES.ALLOW_AUTONOMOUS_EVACUATION_ORDERS, false);
    assert.strictEqual(CRITICAL_SAFETY_BOUNDARIES.ALLOW_AUTONOMOUS_DAM_GATE_CONTROL, false);
    assert.strictEqual(CRITICAL_SAFETY_BOUNDARIES.MANDATORY_HUMAN_IN_THE_LOOP_APPROVAL, true);
  });

  it('preserves official statutory authorities for all four hazards', () => {
    assert.ok(STATUTORY_AUTHORITIES[HazardTypeKey.CYCLONE].authorityName.includes('IMD'));
    assert.ok(STATUTORY_AUTHORITIES[HazardTypeKey.FLOOD].authorityName.includes('CWC'));
    assert.ok(STATUTORY_AUTHORITIES[HazardTypeKey.LANDSLIDE].authorityName.includes('GSI'));
    assert.ok(STATUTORY_AUTHORITIES[HazardTypeKey.TSUNAMI].authorityName.includes('INCOIS'));
  });

  it('preserves scientific limitations and caveats for all four hazards', () => {
    for (const h of Object.values(HazardTypeKey)) {
      const caveat = SCIENTIFIC_CAVEATS[h];
      assert.ok(caveat && caveat.length > 20, `Caveat missing for ${h}`);
    }
    // Verify specific benchmark mentions
    assert.ok(SCIENTIFIC_CAVEATS[HazardTypeKey.FLOOD].includes('0.9189'));
    assert.ok(SCIENTIFIC_CAVEATS[HazardTypeKey.FLOOD].includes('0.9229'));
    assert.ok(SCIENTIFIC_CAVEATS[HazardTypeKey.LANDSLIDE].includes('synthetic'));
    assert.ok(SCIENTIFIC_CAVEATS[HazardTypeKey.TSUNAMI].includes('0.6500'));
    assert.ok(SCIENTIFIC_CAVEATS[HazardTypeKey.TSUNAMI].includes('0.6845'));
  });
});

describe('AI Trigger Service & Deduplication Suite', () => {
  const triggerService = new AiTriggerService();

  it('defaults automatic triggers to disabled pending feature readiness', () => {
    const configs = triggerService.getConfigurations();
    for (const h of Object.values(HazardTypeKey)) {
      assert.strictEqual(
        configs[h].autoTriggerEnabled,
        false,
        `Expected autoTriggerEnabled to be false for ${h}`
      );
    }
  });

  it('generates consistent deterministic fingerprints for equivalent snapshots', () => {
    const p1 = { current_latitude: 18.8, current_longitude: 89.4, current_wind_speed_kts_3min: 35.0 };
    const p2 = { current_wind_speed_kts_3min: 35.0, current_latitude: 18.8, current_longitude: 89.4 };
    const fp1 = triggerService.generateFingerprint(HazardTypeKey.CYCLONE, p1);
    const fp2 = triggerService.generateFingerprint(HazardTypeKey.CYCLONE, p2);
    assert.strictEqual(fp1, fp2);
    assert.strictEqual(fp1.length, 64); // SHA-256 hex length
  });

  it('skips automatic evaluation when feature readiness is disabled', () => {
    const payload = { q_t: 500, q_lag1: 450, q_lag2: 400, q_lag3: 350 };
    const res = triggerService.evaluateAutomaticTrigger(HazardTypeKey.FLOOD, payload);
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.skipCode, 'DISABLED');
    assert.ok(res.reason.includes('disabled pending verified data pipeline readiness'));
  });

  it('rejects stale input data when auto trigger is enabled', () => {
    triggerService.setAutoTriggerEnabled(HazardTypeKey.CYCLONE, true);
    const staleTime = new Date(Date.now() - 10 * 3600 * 1000).toISOString(); // 10h old (> 6h limit)
    const payload = { current_latitude: 18.8, current_longitude: 89.4 };
    const res = triggerService.evaluateAutomaticTrigger(HazardTypeKey.CYCLONE, payload, staleTime);
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.skipCode, 'STALE_DATA');

    // Reset back to false
    triggerService.setAutoTriggerEnabled(HazardTypeKey.CYCLONE, false);
  });

  it('enforces cooldown and deduplication for duplicate snapshots', () => {
    triggerService.setAutoTriggerEnabled(HazardTypeKey.TSUNAMI, true);
    const payload = { magnitude: 8.0, focal_depth_km: 20.0, epicenter_latitude: 4.0, epicenter_longitude: 95.0, gebco_bathymetry_m: -3000, distance_to_nearest_coast_km: 50 };

    const first = triggerService.evaluateAutomaticTrigger(HazardTypeKey.TSUNAMI, payload);
    assert.strictEqual(first.eligible, true);

    const second = triggerService.evaluateAutomaticTrigger(HazardTypeKey.TSUNAMI, payload);
    assert.strictEqual(second.eligible, false);
    assert.strictEqual(second.skipCode, 'DUPLICATE_SNAPSHOT');

    triggerService.setAutoTriggerEnabled(HazardTypeKey.TSUNAMI, false);
  });
});

describe('AI Authorization Guard Suite', () => {
  it('identifies valid operational roles', () => {
    assert.ok(AUTHORIZED_AI_ROLES.includes('CONTROL_ROOM_OPERATOR'));
    assert.ok(AUTHORIZED_AI_ROLES.includes('ALERT_APPROVER'));
    assert.ok(AUTHORIZED_AI_ROLES.includes('ADMIN'));
  });

  it('rejects unauthorized roles such as CITIZEN', () => {
    const mockConfig = { get: (k, d) => 'production' };
    const guard = new AiAuthorizationGuard(mockConfig);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-user-role': 'CITIZEN' },
        }),
      }),
    };

    assert.throws(
      () => guard.canActivate(mockContext),
      /is not authorized to trigger manual AI hazard predictions/
    );
  });

  it('allows authorized operational roles like CONTROL_ROOM_OPERATOR', () => {
    const mockConfig = { get: (k, d) => 'production' };
    const guard = new AiAuthorizationGuard(mockConfig);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-user-role': 'CONTROL_ROOM_OPERATOR', 'x-user-id': 'usr_operator_1' },
        }),
      }),
    };

    assert.strictEqual(guard.canActivate(mockContext), true);
  });
});

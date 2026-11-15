/**
 * AAPADAMITRA — PostgreSQL & PostGIS Integration Verification Script
 * Milestone 02.1.1
 */

const { PrismaClient } = require('../apps/api/node_modules/@prisma/client');
const path = require('path');
const fs = require('fs');

// Load environment variables from apps/api/.env
const envPath = path.resolve(__dirname, '../apps/api/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

async function runVerification() {
  const prisma = new PrismaClient();
  const results = {
    connected: false,
    version: null,
    postgisVersion: null,
    extensions: [],
    tables: [],
    gistIndexes: [],
    tests: {},
    error: null,
  };

  try {
    console.log('Connecting to PostgreSQL database...');
    await prisma.$connect();
    results.connected = true;
    console.log('Connected successfully.');

    // 1. Version
    const versionRes = await prisma.$queryRaw`SELECT version()`;
    results.version = versionRes[0].version;
    console.log('PostgreSQL version:', results.version);

    // 2. PostGIS Version
    try {
      const postgisRes = await prisma.$queryRaw`SELECT PostGIS_Full_Version()`;
      results.postgisVersion = postgisRes[0].postgis_full_version;
      console.log('PostGIS version:', results.postgisVersion);
    } catch (e) {
      results.postgisVersion = 'NOT_AVAILABLE: ' + e.message;
      console.warn('PostGIS not available:', e.message);
    }

    // 3. Active extensions
    const extensionsRes = await prisma.$queryRaw`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname IN ('postgis', 'uuid-ossp')
    `;
    results.extensions = extensionsRes;
    console.log('Active extensions:', extensionsRes);

    // 4. Tables in public schema
    const tablesRes = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    results.tables = tablesRes.map((r) => r.table_name);
    console.log(`Public tables (${results.tables.length}):`, results.tables);

    // 5. GiST indexes
    const indexesRes = await prisma.$queryRaw`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexdef ILIKE '%gist%'
    `;
    results.gistIndexes = indexesRes;
    console.log('GiST Indexes:', indexesRes);

    // 6. Test Data Operations with Safe Cleanup
    const TEST_PREFIX = 'TEST_VERIF_';
    const testAssetCode = TEST_PREFIX + 'ASSET_001';
    const testStationCode = TEST_PREFIX + 'STATION_001';
    const testSourceCode = TEST_PREFIX + 'SRC_001';
    const testModelCode = TEST_PREFIX + 'MODEL_001';
    const testHazardCode = TEST_PREFIX + 'HAZ_001';

    console.log('Executing test data insertion & verification...');

    // Clean up any leftover test data first
    await cleanupTestData(prisma, TEST_PREFIX);

    // 6.1 Insert Hazard Type
    const [hazard] = await prisma.$queryRaw`
      INSERT INTO "hazard_types" ("id", "code", "name", "category", "active", "updated_at")
      VALUES (gen_random_uuid(), ${testHazardCode}, 'Test Flood Hazard', 'HYDROLOGICAL', true, CURRENT_TIMESTAMP)
      RETURNING "id", "code";
    `;

    // 6.2 Insert Infrastructure Asset with PostGIS geography point (lon: 77.2831, lat: 19.1256)
    const [asset] = await prisma.$queryRaw`
      INSERT INTO "infrastructure_assets" (
        "id", "asset_code", "asset_type", "name", "status",
        "latitude", "longitude", "geom", "updated_at"
      ) VALUES (
        gen_random_uuid(), ${testAssetCode}, 'DAM', 'Vishnupuri Test Dam', 'OPERATIONAL',
        19.1256, 77.2831,
        ST_SetSRID(ST_MakePoint(77.2831, 19.1256), 4326)::geography,
        CURRENT_TIMESTAMP
      )
      RETURNING "id", "asset_code", "latitude", "longitude";
    `;
    console.log('Inserted asset:', asset);
    results.tests.assetInserted = true;

    // 6.3 Read asset back and verify coordinates
    const [readAsset] = await prisma.$queryRaw`
      SELECT "id", "asset_code", "latitude", "longitude",
             ST_AsText(geom) AS geom_text
      FROM "infrastructure_assets"
      WHERE "id" = ${asset.id}::uuid
    `;
    console.log('Read back asset:', readAsset);
    results.tests.assetVerified = readAsset.latitude === 19.1256 && readAsset.longitude === 77.2831;

    // 6.4 Insert Monitoring Station linked to Asset
    const [station] = await prisma.$queryRaw`
      INSERT INTO "monitoring_stations" (
        "id", "asset_id", "station_code", "name", "station_type", "status",
        "latitude", "longitude", "geom", "updated_at"
      ) VALUES (
        gen_random_uuid(), ${asset.id}::uuid, ${testStationCode}, 'Vishnupuri Upstream Gauge', 'RIVER_GAUGE', 'ACTIVE',
        19.1260, 77.2820,
        ST_SetSRID(ST_MakePoint(77.2820, 19.1260), 4326)::geography,
        CURRENT_TIMESTAMP
      )
      RETURNING "id", "station_code";
    `;
    console.log('Inserted station:', station);
    results.tests.stationInserted = true;

    // 6.5 Insert Data Source
    const [source] = await prisma.$queryRaw`
      INSERT INTO "data_sources" (
        "id", "code", "name", "source_type", "trust_level", "active", "updated_at"
      ) VALUES (
        gen_random_uuid(), ${testSourceCode}, 'CWC Telemetry Simulator', 'IOT_SENSOR_GATEWAY', 'VERIFIED_OPERATOR', true, CURRENT_TIMESTAMP
      )
      RETURNING "id", "code";
    `;

    // 6.6 Insert Observation
    const obsTime = new Date().toISOString();
    const [observation] = await prisma.$queryRaw`
      INSERT INTO "observations" (
        "id", "data_source_id", "asset_id", "station_id",
        "metric_code", "value", "unit", "observed_at", "quality_status", "provenance_type"
      ) VALUES (
        gen_random_uuid(), ${source.id}::uuid, ${asset.id}::uuid, ${station.id}::uuid,
        'water_level', 351.2500, 'METERS_AMSL', ${obsTime}::timestamptz, 'VALID', 'OBSERVED'
      )
      RETURNING "id", "metric_code", "value", "unit", "quality_status", "observed_at";
    `;
    console.log('Inserted observation:', observation);
    results.tests.observationInserted = true;

    // 6.7 Insert Model Version
    const [modelVer] = await prisma.$queryRaw`
      INSERT INTO "model_versions" (
        "id", "model_code", "version", "hazard_type_id", "model_family", "artifact_uri", "status", "updated_at"
      ) VALUES (
        gen_random_uuid(), ${testModelCode}, 'v1.0.0-test', ${hazard.id}::uuid, 'XGBOOST_INFLOW', 's3://models/test.bin', 'APPROVED_PILOT', CURRENT_TIMESTAMP
      )
      RETURNING "id", "model_code";
    `;

    // 6.8 Insert Independent Prediction
    const validFrom = new Date().toISOString();
    const validTo = new Date(Date.now() + 6 * 3600 * 1000).toISOString();
    const [prediction] = await prisma.$queryRaw`
      INSERT INTO "predictions" (
        "id", "model_version_id", "hazard_type_id", "asset_id",
        "valid_from", "valid_to", "horizon_minutes", "status", "risk_category", "confidence_score"
      ) VALUES (
        gen_random_uuid(), ${modelVer.id}::uuid, ${hazard.id}::uuid, ${asset.id}::uuid,
        ${validFrom}::timestamptz, ${validTo}::timestamptz, 360, 'GENERATED', 'MODERATE', 0.9250
      )
      RETURNING "id", "risk_category", "confidence_score";
    `;
    console.log('Inserted prediction:', prediction);
    results.tests.predictionInserted = true;

    // 6.9 Spatial Query using ST_DWithin (Search within 10 km of coordinate 77.2800, 19.1200)
    const nearby = await prisma.$queryRaw`
      SELECT "id", "asset_code", "name",
             ST_Distance(geom, ST_SetSRID(ST_MakePoint(77.2800, 19.1200), 4326)::geography) AS distance_meters
      FROM "infrastructure_assets"
      WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(77.2800, 19.1200), 4326)::geography, 10000)
        AND "asset_code" = ${testAssetCode}
    `;
    console.log('Spatial ST_DWithin query result:', nearby);
    results.tests.spatialQueryPassed = nearby.length > 0;

    // Clean up test data
    await cleanupTestData(prisma, TEST_PREFIX);
    console.log('Test data cleaned up successfully.');
    results.tests.cleanedUp = true;

  } catch (err) {
    results.error = err.message;
    console.error('Verification error:', err.message);
  } finally {
    await prisma.$disconnect();
  }

  return results;
}

async function cleanupTestData(prisma, prefix) {
  try {
    await prisma.$executeRaw`
      DELETE FROM "prediction_values" WHERE "prediction_id" IN (
        SELECT "id" FROM "predictions" WHERE "model_version_id" IN (
          SELECT "id" FROM "model_versions" WHERE "model_code" LIKE ${prefix + '%'}
        )
      );
    `;
    await prisma.$executeRaw`
      DELETE FROM "predictions" WHERE "model_version_id" IN (
        SELECT "id" FROM "model_versions" WHERE "model_code" LIKE ${prefix + '%'}
      );
    `;
    await prisma.$executeRaw`
      DELETE FROM "model_versions" WHERE "model_code" LIKE ${prefix + '%'};
    `;
    await prisma.$executeRaw`
      DELETE FROM "observations" WHERE "data_source_id" IN (
        SELECT "id" FROM "data_sources" WHERE "code" LIKE ${prefix + '%'}
      );
    `;
    await prisma.$executeRaw`
      DELETE FROM "sensors" WHERE "sensor_code" LIKE ${prefix + '%'};
    `;
    await prisma.$executeRaw`
      DELETE FROM "monitoring_stations" WHERE "station_code" LIKE ${prefix + '%'};
    `;
    await prisma.$executeRaw`
      DELETE FROM "data_sources" WHERE "code" LIKE ${prefix + '%'};
    `;
    await prisma.$executeRaw`
      DELETE FROM "infrastructure_assets" WHERE "asset_code" LIKE ${prefix + '%'};
    `;
    await prisma.$executeRaw`
      DELETE FROM "hazard_types" WHERE "code" LIKE ${prefix + '%'};
    `;
  } catch (e) {
    // Ignore table missing errors during initial cleanup
  }
}

if (require.main === module) {
  runVerification()
    .then((res) => {
      console.log('\n--- FINAL RESULTS JSON ---');
      console.log(JSON.stringify(res, null, 2));
      process.exit(res.error ? 1 : 0);
    })
    .catch((err) => {
      console.error('Fatal execution error:', err);
      process.exit(1);
    });
}

module.exports = { runVerification };


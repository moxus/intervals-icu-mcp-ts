/**
 * Quick script to inspect raw API responses and analyze field usage.
 * Usage: npx tsx scripts/inspect-fields.ts [oldest] [newest]
 */
import axios from 'axios';

const athleteId = process.env.INTERVALS_ATHLETE_ID;
const apiKey = process.env.INTERVALS_API_KEY;

if (!athleteId || !apiKey) {
  console.error('Set INTERVALS_ATHLETE_ID and INTERVALS_API_KEY');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://intervals.icu/api/v1',
  auth: { username: 'API_KEY', password: apiKey },
});

const today = new Date();
const oldest =
  process.argv[2] ?? new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
const newest = process.argv[3] ?? today.toISOString().slice(0, 10);

async function analyzeActivities() {
  console.log(`\n=== Activities (${oldest} → ${newest}) ===\n`);
  const { data } = await client.get(`/athlete/${athleteId}/activities`, {
    params: { oldest, newest },
  });

  const activities = data as Record<string, unknown>[];
  console.log(`Count: ${activities.length}\n`);

  if (activities.length === 0) return;

  // Collect all keys and how often they appear with non-null values
  const fieldStats: Record<string, { count: number; nonNull: number; sample: unknown }> = {};

  for (const act of activities) {
    for (const [key, val] of Object.entries(act)) {
      if (!fieldStats[key]) fieldStats[key] = { count: 0, nonNull: 0, sample: undefined };
      fieldStats[key].count++;
      if (val !== null && val !== undefined) {
        fieldStats[key].nonNull++;
        if (fieldStats[key].sample === undefined) fieldStats[key].sample = val;
      }
    }
  }

  // Sort by frequency
  const sorted = Object.entries(fieldStats).sort((a, b) => b[1].nonNull - a[1].nonNull);

  console.log(`${'Field'.padEnd(40)} ${'Present'.padStart(8)} ${'NonNull'.padStart(8)}  Sample`);
  console.log('-'.repeat(100));
  for (const [key, stats] of sorted) {
    const sample =
      typeof stats.sample === 'string'
        ? `"${stats.sample.slice(0, 40)}"`
        : JSON.stringify(stats.sample)?.slice(0, 40);
    console.log(
      `${key.padEnd(40)} ${String(stats.count).padStart(8)} ${String(stats.nonNull).padStart(8)}  ${sample}`,
    );
  }

  // Print a single full raw activity for reference
  console.log(`\n=== Sample raw activity ===\n`);
  console.log(JSON.stringify(activities[0], null, 2));
}

analyzeActivities().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

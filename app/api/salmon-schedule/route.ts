import {
  createSalmonScheduleEnvelope,
  parseSalmonRotations,
  SALMON_SCHEDULE_SOURCE_URL,
} from '@/lib/salmon-schedule';

const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
  'Content-Type': 'application/json; charset=utf-8',
};

export async function GET() {
  try {
    const response = await fetch(SALMON_SCHEDULE_SOURCE_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`upstream ${response.status}`);
    const rotations = parseSalmonRotations(await response.json());
    if (!rotations.length) throw new Error('invalid upstream schedule');
    return Response.json(createSalmonScheduleEnvelope(rotations), {
      headers: cacheHeaders,
    });
  } catch {
    return Response.json(
      { error: 'salmon_schedule_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

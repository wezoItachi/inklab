import {
  createSalmonScheduleEnvelope,
  parseSalmonRotations,
  SALMON_SCHEDULE_SOURCE_URL,
} from '../../../lib/salmon-schedule.ts';

const UPSTREAM_TIMEOUT_MS = 8_000;
const MAX_UPSTREAM_BYTES = 2 * 1024 * 1024;

const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

type ScheduleFetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export async function fetchSalmonSchedule(fetcher: ScheduleFetcher = fetch) {
  const response = await fetcher(SALMON_SCHEDULE_SOURCE_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`upstream ${response.status}`);
  const declaredSize = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredSize) && declaredSize > MAX_UPSTREAM_BYTES)
    throw new Error('upstream payload too large');
  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > MAX_UPSTREAM_BYTES)
    throw new Error('upstream payload too large');
  const rotations = parseSalmonRotations(JSON.parse(body));
  if (!rotations.length) throw new Error('invalid upstream schedule');
  return createSalmonScheduleEnvelope(rotations);
}

export async function GET() {
  try {
    return Response.json(await fetchSalmonSchedule(), { headers: cacheHeaders });
  } catch {
    return Response.json(
      { error: 'salmon_schedule_unavailable' },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        },
      },
    );
  }
}

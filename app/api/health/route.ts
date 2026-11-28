import databaseManifest from '../../../database/manifest.json' with { type: 'json' };

const headers = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

export async function GET() {
  return Response.json(
    {
      status: 'ok',
      service: 'inklab',
      schemaVersion: 1,
      gameData: {
        version: databaseManifest.gameVersion,
        updatedAt: databaseManifest.updatedAt,
      },
    },
    { headers },
  );
}

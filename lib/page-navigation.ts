export const pageIds = ['lab', 'salmon', 'wiki', 'library', 'motion'] as const;

export type PageId = (typeof pageIds)[number];

const pageIdSet = new Set<string>(pageIds);

export function parsePageHash(hash: string): PageId {
  const candidate = hash.trim().replace(/^#/, '').trim().toLowerCase();
  return pageIdSet.has(candidate) ? (candidate as PageId) : 'lab';
}

export function getPageHash(page: PageId): `#${PageId}` {
  return `#${page}`;
}

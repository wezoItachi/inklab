import {totalAp, type LoadoutSlot} from './loadouts.ts';

export const LOCAL_LOADOUT_KEY = 'inklab:loadout:v1';

export type ShareableLoadout = {
  weaponId: string;
  slots: LoadoutSlot[];
};

export function encodeLoadoutQuery({weaponId, slots}: ShareableLoadout) {
  const query = new URLSearchParams();
  query.set('w', weaponId);
  query.set('g', slots.map(([abilityId, ap]) => `${abilityId}.${ap}`).join(','));
  return query.toString();
}

export function decodeLoadoutQuery(
  search: string,
  weaponIds: ReadonlySet<string>,
  abilityIds: ReadonlySet<string>,
): ShareableLoadout | undefined {
  const query = new URLSearchParams(search);
  const weaponId = query.get('w');
  const encodedSlots = query.get('g');
  if (!weaponId || !weaponIds.has(weaponId) || !encodedSlots) return undefined;

  const slots = encodedSlots.split(',').map((encoded): LoadoutSlot | undefined => {
    const separator = encoded.lastIndexOf('.');
    if (separator < 1) return undefined;
    const abilityId = encoded.slice(0, separator);
    const ap = Number(encoded.slice(separator + 1));
    if (!abilityIds.has(abilityId) || (ap !== 3 && ap !== 10)) return undefined;
    return [abilityId, ap];
  });

  if (slots.length !== 12 || slots.some((slot) => !slot)) return undefined;
  const validSlots = slots as LoadoutSlot[];
  if (totalAp(validSlots) !== 57 || validSlots.filter(([, ap]) => ap === 10).length !== 3) return undefined;
  return {weaponId, slots: validSlots};
}

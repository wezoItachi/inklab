import type { EditableLoadoutSlot } from './loadouts.ts';

export const LOCAL_LOADOUT_KEY = 'inklab:loadout:v1';

export type ShareableLoadout = {
  weaponId: string;
  slots: EditableLoadoutSlot[];
};

const legacyWeaponIdAliases: Readonly<Record<string, string>> = {
  'shooter-short-cstm11': 'shooter-precision',
};

export function encodeLoadoutQuery({ weaponId, slots }: ShareableLoadout) {
  const query = new URLSearchParams();
  query.set('w', weaponId);
  query.set(
    'g',
    slots.map(([abilityId, ap]) => `${abilityId ?? '_'}.${ap}`).join(','),
  );
  return query.toString();
}

export function decodeLoadoutQuery(
  search: string,
  weaponIds: ReadonlySet<string>,
  abilityIds: ReadonlySet<string>,
): ShareableLoadout | undefined {
  const query = new URLSearchParams(search);
  const encodedWeaponId = query.get('w');
  const weaponId = encodedWeaponId
    ? (legacyWeaponIdAliases[encodedWeaponId] ?? encodedWeaponId)
    : null;
  const encodedSlots = query.get('g');
  if (!weaponId || !weaponIds.has(weaponId) || !encodedSlots) return undefined;

  const slots = encodedSlots
    .split(',')
    .map((encoded): EditableLoadoutSlot | undefined => {
      const separator = encoded.lastIndexOf('.');
      if (separator < 1) return undefined;
      const abilityId = encoded.slice(0, separator);
      const ap = Number(encoded.slice(separator + 1));
      if ((abilityId !== '_' && !abilityIds.has(abilityId)) || (ap !== 3 && ap !== 10))
        return undefined;
      return [abilityId === '_' ? null : abilityId, ap];
    });

  if (slots.length !== 12 || slots.some((slot) => !slot)) return undefined;
  const validSlots = slots as EditableLoadoutSlot[];
  if (validSlots.some(([, ap], index) => ap !== (index % 4 === 0 ? 10 : 3)))
    return undefined;
  return { weaponId, slots: validSlots };
}

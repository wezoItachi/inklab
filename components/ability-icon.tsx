import { getAbilityAssetUrl, type Ability } from '@/lib/abilities';

export function AbilityIcon({ ability, small = false }: { ability?: Ability; small?: boolean }) {
  const url = ability ? getAbilityAssetUrl(ability.id) : undefined;
  return (
    <span className={`ink-icon ${small ? 'small' : ''}`}>
      {/* oxlint-disable-next-line next/no-img-element -- Local 35px ability icons do not benefit from image optimization. */}
      {url ? <img src={url} alt="" /> : ability?.short.slice(0, 1) || '+'}
    </span>
  );
}


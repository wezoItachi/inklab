import { MainWeaponParameterAudit } from './main-weapon-parameter-audit';
import { ParameterStatusStrip } from './parameter-status-strip';
import { getWeaponParameterSnapshot } from '@/lib/weapon-parameter-status';
import { getWeapon } from '@/lib/weapon-catalog';

export function MainWeaponVerification({ weaponId }: { weaponId: string }) {
  const weapon = getWeapon(weaponId);
  return (
    <>
      <ParameterStatusStrip snapshot={getWeaponParameterSnapshot(weapon)} />
      <MainWeaponParameterAudit weaponId={weaponId} />
    </>
  );
}

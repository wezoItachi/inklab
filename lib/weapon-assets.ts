export function getMainWeaponAssetUrl(weaponId: string) {
  return `/assets/weapons/main/${encodeURIComponent(weaponId)}.png`;
}

export function getSubWeaponAssetUrl(subWeaponId: string) {
  return `/assets/weapons/sub/${encodeURIComponent(subWeaponId)}.png`;
}

export function getSpecialWeaponAssetUrl(specialWeaponId: string) {
  return `/assets/weapons/special/${encodeURIComponent(specialWeaponId)}.png`;
}

export type WeaponPickerItem = {
  id: string;
  name: string;
  family: string;
  badge?: string;
  meta?: string;
  tags?: readonly string[];
};

export function getWeaponPickerFamilies(items: readonly WeaponPickerItem[]) {
  return [...new Set(items.map(({family}) => family))];
}

export function filterWeaponPickerItems(
  items: readonly WeaponPickerItem[],
  family: string,
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');
  return items.filter((item) => {
    if (family !== '全部' && item.family !== family) return false;
    if (!normalizedQuery) return true;
    return [item.name,item.family,item.meta??'',...(item.tags??[])]
      .some((value) => value.toLocaleLowerCase('zh-CN').includes(normalizedQuery));
  });
}

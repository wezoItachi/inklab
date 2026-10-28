export type LinearNavigationKey =
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'End'
  | 'Home';

export function getLinearNavigationIndex(
  currentIndex: number,
  key: LinearNavigationKey,
  itemCount: number,
) {
  if (itemCount <= 0) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return itemCount - 1;
  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return (currentIndex + 1 + itemCount) % itemCount;
  }
  return (currentIndex - 1 + itemCount) % itemCount;
}

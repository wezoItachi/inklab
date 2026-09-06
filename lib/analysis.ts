export const ROLL_REVERSE_MIN_DEGREES = 120;
export const ROLL_REVERSE_WINDOW_MS = 900;
export const ROLL_JUMP_WINDOW_MS = 350;

export function consecutiveUsesFromFullTank(costPercent: number) {
  if (!Number.isFinite(costPercent) || costPercent <= 0) throw new RangeError('Ink cost must be positive');
  return Math.floor((100 + Number.EPSILON) / costPercent);
}

export function meetsConsecutiveUseThreshold(costPercent: number, uses: number) {
  if (!Number.isInteger(uses) || uses < 1) throw new RangeError('Uses must be a positive integer');
  return consecutiveUsesFromFullTank(costPercent) >= uses;
}

export function angleDifferenceDegrees(
  previous: { x: number; y: number },
  current: { x: number; y: number },
) {
  const previousLength = Math.hypot(previous.x, previous.y);
  const currentLength = Math.hypot(current.x, current.y);
  if (previousLength === 0 || currentLength === 0) return 0;
  const cosine = (current.x * previous.x + current.y * previous.y) / (currentLength * previousLength);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
}

export function isRollReverse(angle: number, elapsedMs: number) {
  return angle >= ROLL_REVERSE_MIN_DEGREES && elapsedMs >= 0 && elapsedMs < ROLL_REVERSE_WINDOW_MS;
}

export function isRollJumpTiming(delayMs: number) {
  return delayMs > 0 && delayMs <= ROLL_JUMP_WINDOW_MS;
}


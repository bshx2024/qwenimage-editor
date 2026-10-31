export const GUEST_TRIAL_LIMIT = 1;

/**
 * Returns how many guest trial generations have been used on this device
 */
export function getGuestTrialUsed(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(localStorage.getItem('qwen_guest_trial_used') || 0);
  } catch {
    return 0;
  }
}

/**
 * Returns how many guest trial generations remain on this device
 */
export function getGuestTrialsRemaining(): number {
  const used = getGuestTrialUsed();
  return Math.max(0, GUEST_TRIAL_LIMIT - used);
}

/**
 * Increments the guest trial count on this device
 */
export function recordGuestTrialUse(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const next = getGuestTrialUsed() + 1;
    localStorage.setItem('qwen_guest_trial_used', String(next));
    return next;
  } catch {
    return 1;
  }
}

import type { HumorPreferences } from './models';
import { decodeHumorPreferences } from './preferences';
export function canRoast(settings: HumorPreferences | null | undefined): boolean {
  try {
    const verified = decodeHumorPreferences(JSON.stringify(settings));
    return verified.adult.enabled && verified.adult.consent !== null;
  } catch { return false; }
}

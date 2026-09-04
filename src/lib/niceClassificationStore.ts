import { NiceClassificationItem, NiceClassSummary } from '../data/niceClassificationData';
import { FULL_STANDARD_NICE_CLASSES_META } from '../data/fullNiceClassificationMeta';
import { COMPLETE_STANDARD_NICE_ITEMS } from '../data/completeStandardNiceItems';

const STORAGE_KEY = 'usmile_nice_classification_mappings_v4_standard_full';
const EVENT_NAME = 'usmile_nice_classification_updated';

export function getNiceClassificationMappings(): NiceClassificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 45) {
        return parsed.sort((a, b) => a.classNum - b.classNum || a.groupCode.localeCompare(b.groupCode));
      }
    }
  } catch (e) {
    console.error('Failed to load Nice Classification mappings from localStorage:', e);
  }
  
  // Default to full 45 classes standard items
  const defaults = [...COMPLETE_STANDARD_NICE_ITEMS].sort((a, b) => a.classNum - b.classNum || a.groupCode.localeCompare(b.groupCode));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch {
    // Ignore storage write error
  }
  return defaults;
}

export function saveNiceClassificationMappings(items: NiceClassificationItem[]): void {
  try {
    const sorted = [...items].sort((a, b) => a.classNum - b.classNum || a.groupCode.localeCompare(b.groupCode));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {
    console.error('Failed to save Nice Classification mappings to localStorage:', e);
  }
}

export function resetNiceClassificationMappings(): NiceClassificationItem[] {
  try {
    const sorted = [...COMPLETE_STANDARD_NICE_ITEMS].sort((a, b) => a.classNum - b.classNum || a.groupCode.localeCompare(b.groupCode));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
    return sorted;
  } catch (e) {
    console.error('Failed to reset Nice Classification mappings:', e);
    return [...COMPLETE_STANDARD_NICE_ITEMS].sort((a, b) => a.classNum - b.classNum || a.groupCode.localeCompare(b.groupCode));
  }
}

export function subscribeNiceClassificationChanges(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export const NICE_CLASSES_META: NiceClassSummary[] = FULL_STANDARD_NICE_CLASSES_META;
export type { NiceClassificationItem, NiceClassSummary };


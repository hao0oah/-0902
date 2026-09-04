import { CaseOfficialDocument } from '../types';

const SYNCED_DOCS_STORAGE_KEY = 'usmile_synced_case_documents_v1';

// In-memory cache
let syncedDocsCache: Record<string, CaseOfficialDocument[]> | null = null;
const listeners = new Set<() => void>();

function loadFromStorage(): Record<string, CaseOfficialDocument[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SYNCED_DOCS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load synced documents from storage', e);
  }
  return {};
}

function saveToStorage(data: Record<string, CaseOfficialDocument[]>): void {
  syncedDocsCache = data;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYNCED_DOCS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save synced documents to storage', e);
    }
  }
  listeners.forEach(fn => {
    try {
      fn();
    } catch (err) {
      console.error('Listener callback error', err);
    }
  });
}

export function getSyncedCaseDocs(caseKey: string): CaseOfficialDocument[] {
  if (!caseKey) return [];
  if (!syncedDocsCache) {
    syncedDocsCache = loadFromStorage();
  }
  return syncedDocsCache[caseKey] || [];
}

export function getAllSyncedDocsMap(): Record<string, CaseOfficialDocument[]> {
  if (!syncedDocsCache) {
    syncedDocsCache = loadFromStorage();
  }
  return { ...syncedDocsCache };
}

export function addSyncedDocToCase(caseKey: string, doc: CaseOfficialDocument): void {
  if (!caseKey || !doc) return;
  const current = loadFromStorage();
  const list = current[caseKey] || [];
  // Check if already exists
  const existingIdx = list.findIndex(d => d.id === doc.id);
  let updatedList: CaseOfficialDocument[];
  if (existingIdx >= 0) {
    updatedList = [...list];
    updatedList[existingIdx] = doc;
  } else {
    updatedList = [doc, ...list];
  }
  current[caseKey] = updatedList;
  saveToStorage(current);
}

export function subscribeDocSync(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

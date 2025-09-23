import { STORAGE_KEY } from './state.js';
import type { group } from './types';

export function loadFromStorage(): group[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as group[];
    if (Array.isArray(data?.groups)) return data.groups as group[];
    return [];
  } catch {
    return [];
  }
}

export function saveToStorage(groups: group[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}



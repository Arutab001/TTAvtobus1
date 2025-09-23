import type { group } from './types';

export const STORAGE_KEY = 'contactGroups';

export let groups: group[] = [];
export let isGroupsMenuOpen = false;
export let isContactsMenuOpen = false;
export const expandedGroups: Set<string> = new Set();

export function setGroups(next: group[]): void {
  groups = next;
}



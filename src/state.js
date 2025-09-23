export const STORAGE_KEY = 'contactGroups';
export let groups = [];
export let isGroupsMenuOpen = false;
export let isContactsMenuOpen = false;
export const expandedGroups = new Set();
export function setGroups(next) {
    groups = next;
}
//# sourceMappingURL=state.js.map
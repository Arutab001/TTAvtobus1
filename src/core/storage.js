import { STORAGE_KEY } from './state.js';
export function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const data = JSON.parse(raw);
        if (Array.isArray(data))
            return data;
        if (Array.isArray(data?.groups))
            return data.groups;
        return [];
    }
    catch {
        return [];
    }
}
export function saveToStorage(groups) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}
//# sourceMappingURL=storage.js.map
declare const groups_list: HTMLElement | null;
declare const groups_button: Element | null;
interface contact {
    name: string;
    number: string;
}
interface group {
    name: string;
    contacts: contact[];
}
declare let groups: group[];
declare let isGroupsMenuOpen: boolean;
declare function toggleGroupsMenu(): void;
declare function showGroupsMenu(): void;
declare function hideGroupsMenu(): void;
declare function addGroup(): void;
//# sourceMappingURL=index.d.ts.map
type DropdownHandler = (value?: string) => void;
export declare class CustomDropdown {
    private root;
    private button;
    private list;
    private items;
    private handlers;
    value: string;
    constructor(container: HTMLElement);
    bind(event: 'change' | 'open' | 'close', handler: DropdownHandler): void;
    dataItems(items: string[], selected?: string): void;
    private renderList;
    private setValue;
    private open;
    private close;
    private toggle;
    private emit;
    private positionList;
}
export {};
//# sourceMappingURL=dropdown.d.ts.map
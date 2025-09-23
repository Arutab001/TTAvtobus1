// Simple custom dropdown component
// Public API:
// - bind(event, handler): subscribe to 'change' | 'open' | 'close'
// - dataItems(items: string[]): set list items
// - value: current selected value (string)

type DropdownHandler = (value?: string) => void;

export class CustomDropdown {
  private root: HTMLElement;
  private button: HTMLButtonElement;
  private list: HTMLUListElement;
  private items: string[] = [];
  private handlers: Record<string, DropdownHandler[]> = { change: [], open: [], close: [] };
  public value: string = '';

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'dd';
    this.button = document.createElement('button');
    this.button.className = 'dd__btn';
    this.button.type = 'button';
    this.button.textContent = 'Выберите...';
    this.list = document.createElement('ul');
    this.list.className = 'dd__list';
    this.root.appendChild(this.button);
    this.root.appendChild(this.list);
    container.appendChild(this.root);

    this.button.addEventListener('click', () => this.toggle());
    document.addEventListener('click', (e) => {
      if (!this.root.contains(e.target as Node)) this.close();
    });
  }

  public bind(event: 'change' | 'open' | 'close', handler: DropdownHandler): void {
    (this.handlers[event] ||= []).push(handler);
  }

  public dataItems(items: string[], selected?: string): void {
    this.items = items.slice();
    this.renderList();
    const sel = selected && items.includes(selected) ? selected : (items[0] ?? '');
    this.setValue(sel, false);
  }

  private renderList(): void {
    this.list.innerHTML = '';
    this.items.forEach((label) => {
      const li = document.createElement('li');
      li.className = 'dd__item';
      li.textContent = label;
      li.tabIndex = 0;
      li.addEventListener('click', () => { this.setValue(label); this.close(); });
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); this.setValue(label); this.close(); }
      });
      this.list.appendChild(li);
    });
  }

  private setValue(next: string, notify: boolean = true): void {
    this.value = next;
    this.button.textContent = next || 'Выберите...';
    if (notify) this.emit('change', next);
  }

  private open(): void {
    if (!this.root.classList.contains('dd--open')) {
      this.root.classList.add('dd--open');
      this.positionList();
      this.emit('open');
    }
  }

  private close(): void {
    if (this.root.classList.contains('dd--open')) {
      this.root.classList.remove('dd--open');
      this.emit('close');
    }
  }

  private toggle(): void {
    this.root.classList.contains('dd--open') ? this.close() : this.open();
  }

  private emit(event: 'change' | 'open' | 'close', value?: string): void {
    for (const h of this.handlers[event] || []) h(value);
  }

  private positionList(): void {
    const rect = this.button.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    this.list.style.position = 'absolute';
    this.list.style.top = `${this.button.offsetHeight + 2}px`;
    this.list.style.left = '0';
    this.list.style.width = '100%';
  }
  
}



import { groups, expandedGroups } from '../core/state.js';
import { saveToStorage } from '../core/storage.js';
import type { group } from '../core/types.js';
import { startInlineEdit, openDeleteContactModal } from './inline-edit.js';
import { showSuccessToast } from './toast.js';

export function showGroupsMenu(): void {
  const menuHTML = `
    <div class="groups-menu">
      <h3>Группы контактов <img src="./svg/Close.svg" id="close-menu-btn" /></h3>
      ${groups.length === 0 ? 
        '<p class="empty-groups">Групп пока нет</p>' :
        groups.map(group => {
          const isExpanded = expandedGroups.has(group.name);
          
          return `
          <div class=\"group-item-container\">
            <div class=\"group-item\" data-name=\"${group.name}\"> 
              <div class=\"menu-group-header${isExpanded ? ' expanded' : ''}\"> 
                <span class=\"group-name\">${group.name}</span>
              </div>
            </div>
            <div class=\"menu-actions\">\n
                  <button class=\"delete-group\" title=\"Удалить группу\" aria-label=\"Удалить группу\"> \n                    
                  <img src=\"./svg/delete.svg\" alt=\"delete\"/> \n 
                  </button>
                </div>
          </div>
            `;
        }).join('')
      }
      <div class="menu-buttons">
        <button id="add-group-btn">Добавить</button>
        <button id="save-groups-btn">Сохранить</button>
      </div>
    </div>
  `;
  
  const menu = document.createElement('div');
  menu.className = 'groups-menu-overlay';
  menu.innerHTML = menuHTML;
  document.body.appendChild(menu);

  const addGroupBtn = menu.querySelector('#add-group-btn');
  addGroupBtn?.addEventListener('click', showAddGroupCard);

  const closeMenuBtn = menu.querySelector('#close-menu-btn');
  closeMenuBtn?.addEventListener('click', hideGroupsMenu);

  const saveGroupsBtn = menu.querySelector('#save-groups-btn');
  saveGroupsBtn?.addEventListener('click', saveGroups);

  // Делегирование клика по кнопке удаления (устойчиво к перерисовкам)
  let lastDeleteInvoke = 0;
  const handleDeleteInvoke = (e: Event) => {
    
    const target = e.target as HTMLElement;
    const delBtn = target.closest('.delete-group') as HTMLElement | null;
    if (!delBtn) return;
    
    const itemContainer = delBtn.closest('.group-item-container') as HTMLElement | null;
if (!itemContainer) return;
const groupEl = itemContainer.querySelector('.group-item') as HTMLElement | null;
if (!groupEl) return;
const name = groupEl.getAttribute('data-name') || '';
if (!name) return;
openDeleteGroupModal(name);

    const now = Date.now();
    if (now - lastDeleteInvoke < 200) return; // debounce
    
    lastDeleteInvoke = now;
    e.preventDefault();
    e.stopPropagation();
    openDeleteGroupModal(name);
  };
  menu.addEventListener('click', handleDeleteInvoke, true);
  menu.addEventListener('mousedown', handleDeleteInvoke, true);

  const menuButtons = menu.querySelector('.menu-buttons') as HTMLElement | null;
  let expandedCount = 0;
  menu.querySelectorAll('.menu-group-header').forEach((header) => {
    header.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.delete-group')) return;

      const item = (header as HTMLElement).closest('.group-item') as HTMLElement | null;
      if (!item) return;
      const name = item.getAttribute('data-name') || '';
      const panel = item.querySelector('.menu-contacts-panel') as HTMLElement | null;
      const arrow = item.querySelector('.menu-arrow-icon') as HTMLElement | null;
      const headerEl = item.querySelector('.menu-group-header') as HTMLElement | null;
      if (!panel || !arrow || !headerEl) return;

      const expanded = expandedGroups.has(name);
      if (expanded) {
        expandedGroups.delete(name);
        headerEl.classList.remove('expanded');
        arrow.classList.remove('rotated');
        panel.style.maxHeight = '0';
        expandedCount = Math.max(0, expandedCount - 1);
      } else {
        expandedGroups.add(name);
        headerEl.classList.add('expanded');
        arrow.classList.add('rotated');
        panel.style.maxHeight = '999px';
        expandedCount += 1;
      }

      if (menuButtons) {
        if (expandedCount > 0) menuButtons.classList.add('hidden');
        else menuButtons.classList.remove('hidden');
      }
    });
  });

  menu.querySelectorAll('.menu-contacts-panel .contact-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const row = (e.currentTarget as HTMLElement).closest('.contact-row') as HTMLElement | null;
      if (!row) return;
      const groupName = row.getAttribute('data-group') || '';
      const index = parseInt(row.getAttribute('data-index') || '-1', 10);
      startInlineEdit(row, groupName, index);
      e.stopPropagation();
    });
  });
  menu.querySelectorAll('.menu-contacts-panel .contact-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const row = (e.currentTarget as HTMLElement).closest('.contact-row') as HTMLElement | null;
      if (!row) return;
      const groupName = row.getAttribute('data-group') || '';
      const index = parseInt(row.getAttribute('data-index') || '-1', 10);
      openDeleteContactModal(groupName, index);
      e.stopPropagation();
    });
  });

  setTimeout(() => { menu.classList.add('show'); }, 10);
}

export function hideGroupsMenu(): void {
  const menu = document.querySelector('.groups-menu-overlay');
  if (!menu) return;
  menu.classList.remove('show');
  setTimeout(() => menu.remove(), 300);
}

export function showAddGroupCard(): void {
  const overlay = document.querySelector('.groups-menu-overlay');
  if (!overlay) return;
  if (overlay.querySelector('#new-group-card')) return;

  const card = document.createElement('div');
  card.className = 'group-item-container';
  card.id = 'new-group-card';
  card.innerHTML = `
    <div class="group-item edit" data-name="">
      <div class="menu-group-header expanded">
        <input id="new-group-name" type="text" placeholder="Название новой группы" class="group-name-input" />
      </div>
    </div>
    <div class="menu-actions">
      <button class="delete-group" title="Удалить группу" aria-label="Удалить группу" disabled>
        <img src="./svg/delete.svg" alt="delete"/>
      </button>
    </div>
  `;

  const menu = overlay.querySelector('.groups-menu');
  const buttons = menu?.querySelector('.menu-buttons');
  if (menu) {
    if (buttons) menu.insertBefore(card, buttons);
    else menu.appendChild(card);
  }

  const input = card.querySelector('#new-group-name') as HTMLInputElement | null;
  input?.focus();
}


export function saveGroups(): void {
  const overlay = document.querySelector('.groups-menu-overlay');
  const input = overlay?.querySelector('#new-group-name') as HTMLInputElement | null;
  if (input) {
    const candidate = (input.value || '').trim();
    if (!candidate) { alert('Введите название группы'); input.focus(); return; }
    const exists = groups.some(g => g.name.toLowerCase() === candidate.toLowerCase());
    if (exists) { alert('Группа с таким названием уже существует'); input.focus(); return; }
    const newGroup: group = { name: candidate, contacts: [] };
    groups.push(newGroup);
  }
  saveToStorage(groups);
  hideGroupsMenu();
  showGroupsMenu();
  const rerenderMain = (window as any).renderMainGroups as (() => void) | undefined;
  rerenderMain?.();
  showSuccessToast('Группа создана');
}

function openDeleteGroupModal(groupName: string): void {
  if (document.querySelector('.modal-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `

    <h4>Удалить группу</h4>
    <p>Вы уверены, что хотите удалить группу "${groupName}"?</p>
    <div class="modal-actions">
      <button id="modal-cancel">Отмена</button>
      <button id="modal-confirm" class="danger">Удалить</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  modal.querySelector('#modal-cancel')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  modal.querySelector('#modal-confirm')?.addEventListener('click', () => {
    const idx = groups.findIndex(g => g.name === groupName);
    if (idx >= 0) {
      groups.splice(idx, 1);
      expandedGroups.delete(groupName);
      saveToStorage(groups);
      close();
      hideGroupsMenu();
      showGroupsMenu();
      const rerenderMain = (window as any).renderMainGroups as (() => void) | undefined;
      rerenderMain?.();
      showSuccessToast('Группа удалена');
    } else {
      close();
    }
  });
}



import type { contact, group } from './core/types.js';
import { groups, expandedGroups, setGroups } from './core/state.js';
import { loadFromStorage, saveToStorage } from './core/storage.js';
import { sanitizePhoneInput, isValidPhone, markInvalid, clearInvalid } from './core/validation.js';
import { showSuccessToast } from './ui/toast.js';
import { showGroupsMenu, hideGroupsMenu } from './ui/groups-menu.js';
import { CustomDropdown } from './ui/dropdown.js';

const groups_list = document.getElementById("groups");
const add_contact_button = document.getElementById('add-group-button');
const add_contact_header_button = document.getElementById('add-contact-header');
const group_button_desktop = document.getElementById('add-group-desktop');

let lastGroupsToggleAt = 0;
let lastContactsToggleAt = 0;

function toggleGroupsMenu(): void {
  const now = Date.now();
  if (now - lastGroupsToggleAt < 250) return;
  lastGroupsToggleAt = now;
  const opened = document.querySelector('.groups-menu-overlay');
  if (opened) hideGroupsMenu(); else showGroupsMenu();
}

function toggleAddContactMenu(): void {
  const now = Date.now();
  if (now - lastContactsToggleAt < 250) return;
  lastContactsToggleAt = now;
  const opened = document.querySelector('.contacts-menu-overlay');
  if (opened) hideAddContactMenu(); else showAddContactMenu();
}

function showAddContactMenu(): void {
  if (document.querySelector('.contacts-menu-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'contacts-menu-overlay';
  overlay.innerHTML = `
    <div class="contacts-menu">
      <h3>Добавить контакт <img src="./svg/Close.svg" id="close-contact-menu" /></h3>
      <div class="form-field"><label for="contact-name">ФИО</label><input id="contact-name" type="text" placeholder="Введите ФИО" /></div>
      <div class="form-field"><label for="contact-number">Номер телефона</label><input id="contact-number" type="tel" placeholder="Введите номер" /></div>
      <div class="form-field"><label for="contact-group-dd">Группа</label><div id="contact-group-dd"></div></div>
      <div class="contact-menu-buttons"><button id="cancel-contact">Отмена</button><button id="save-contact" class="primary">Сохранить</button></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const ddContainer = overlay.querySelector('#contact-group-dd') as HTMLElement | null;
  if (ddContainer) {
    const dd = new CustomDropdown(ddContainer);
    dd.dataItems(groups.map(g => g.name));
    (overlay as any)._dd = dd;
  }

  overlay.querySelector('#close-contact-menu')?.addEventListener('click', hideAddContactMenu);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) hideAddContactMenu(); });
  overlay.querySelector('#cancel-contact')?.addEventListener('click', hideAddContactMenu);
  overlay.querySelector('#save-contact')?.addEventListener('click', saveContactFromMenu);

  const numInput = overlay.querySelector('#contact-number') as HTMLInputElement | null;
  if (numInput && (window as any).IMask) {
    (window as any).IMask(numInput, { mask: '+{7} (000) 000-00-00' });
  } else {
    numInput?.addEventListener('input', () => {
      if (!numInput) return;
      const caret = numInput.selectionStart || 0;
      const before = numInput.value;
      numInput.value = sanitizePhoneInput(numInput.value);
      const delta = before.length - numInput.value.length;
      numInput.selectionStart = numInput.selectionEnd = Math.max(0, caret - delta);
    });
  }

  setTimeout(() => overlay.classList.add('show'), 10);
}

function hideAddContactMenu(): void {
  const overlay = document.querySelector('.contacts-menu-overlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  setTimeout(() => overlay.remove(), 300);
}

function saveContactFromMenu(): void {
  const overlay = document.querySelector('.contacts-menu-overlay');
  if (!overlay) return;
  const nameInput = overlay.querySelector('#contact-name') as HTMLInputElement | null;
  const numInput = overlay.querySelector('#contact-number') as HTMLInputElement | null;
  const dd: CustomDropdown | undefined = (overlay as any)._dd;

  const fullName = (nameInput?.value || '').trim();
  const phone = (numInput?.value || '').trim();
  const groupName = dd?.value || '';

  let hasError = false;
  if (!fullName) { markInvalid(nameInput!, 'Поле не должно быть пустым'); hasError = true; } else { clearInvalid(nameInput!); }
  if (!phone || !isValidPhone(sanitizePhoneInput(phone))) { markInvalid(numInput!, 'Неверный номер'); hasError = true; } else { clearInvalid(numInput!); }
  if (!groupName) { hasError = true; }
  if (hasError) return;

  const group = groups.find(g => g.name === groupName);
  if (!group) { alert('Группа не найдена'); return; }

  group.contacts.push({ name: fullName, number: sanitizePhoneInput(phone) });
  saveToStorage(groups);

  hideAddContactMenu();
  renderMainGroups();
  showSuccessToast('Контакт успешно создан');
}

function startInlineEdit(row: HTMLElement, groupName: string, index: number) {
  const contactData = groups.find(g => g.name === groupName)!.contacts[index];

  // заменяем только текст на input, оставляем кнопки
  const nameSpan = row.querySelector('.contact-name')!;
  const numberSpan = row.querySelector('.contact-number')!;

  const nameInput = document.createElement('input');
  nameInput.value = contactData.name;
  nameInput.className = 'contact-name inline-input';
  nameInput.style.width = 'calc(100% - 4px)';

  const numberInput = document.createElement('input');
  numberInput.value = contactData.number;
  numberInput.className = 'contact-number inline-input';
  numberInput.style.width = 'calc(100% - 4px)';

  nameSpan.replaceWith(nameInput);
  numberSpan.replaceWith(numberInput);

  row.dataset.editing = 'true';

  const saveChanges = () => {
    const newName = nameInput.value.trim();
    const newNumber = numberInput.value.trim();
    let hasError = false;
    if (!newName) { markInvalid(nameInput, 'Поле не должно быть пустым'); hasError = true; } else { clearInvalid(nameInput); }
    if (!newNumber || !isValidPhone(sanitizePhoneInput(newNumber))) { markInvalid(numberInput, 'Неверный номер'); hasError = true; } else { clearInvalid(numberInput); }
    if (hasError) return;

    contactData.name = newName;
    contactData.number = sanitizePhoneInput(newNumber);
    saveToStorage(groups);
    renderMainGroups();
    showSuccessToast('Контакт обновлён');
  };

  const cancelChanges = () => {
    renderMainGroups();
  };

  const actions = row.querySelector('.contact-actions')!;
  const editBtn = actions.querySelector('.contact-edit')!;
  const deleteBtn = actions.querySelector('.contact-delete')!;



  editBtn.onclick = saveChanges;
  deleteBtn.onclick = cancelChanges;
}

function renderMainGroups(): void {
  if (!groups_list) return;
  if (groups.length === 0) { groups_list.innerHTML = `<p class="empty-list">Список контактов пуст</p>`; return; }

  groups_list.innerHTML = groups.map(g => {
    const isExpanded = expandedGroups.has(g.name);
    const contactsHtml = g.contacts.length === 0 ? '<div class="no-contacts">Нет контактов</div>' : g.contacts.map((c, idx) => `
      <div class="contact-row" data-group="${g.name}" data-index="${idx}" data-editing="false">
        <span class="contact-name">${c.name}</span>
        <span class="contact-number">${c.number}</span>
        <span class="contact-actions">
          <button class="contact-edit" title="Редактировать" aria-label="Редактировать">
            <img src="./svg/editing.svg" alt="edit"/>
          </button>
          <button class="contact-delete" title="Удалить" aria-label="Удалить">
            <img src="./svg/delete.svg" alt="delete"/>
          </button>
        </span>
      </div>
    `).join('');

    return `
      <div class="main-group" data-name="${g.name}">
        <div class="group-header${isExpanded ? ' expanded' : ''}">
          <span class="group-title">${g.name}</span>
          <svg class="arrow-icon${isExpanded ? ' rotated' : ''}" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="contacts-panel" style="max-height: ${isExpanded ? 'none' : '0'}; overflow: hidden;">
          ${contactsHtml}
        </div>
      </div>
    `;
  }).join('');

  groups_list.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const editBtn = target.closest('.contact-edit');
    if (editBtn) {
      const row = editBtn.closest('.contact-row');
      if (row && row.dataset.editing === 'false') {
        const groupName = row.getAttribute('data-group')!;
        const index = parseInt(row.getAttribute('data-index')!, 10);
        startInlineEdit(row, groupName, index);
      }
      e.stopPropagation();
      return;
    }

    const deleteBtn = target.closest('.contact-delete');
    if (deleteBtn) {
      const row = deleteBtn.closest('.contact-row');
      if (row && row.dataset.editing === 'false') {
        const groupName = row.getAttribute('data-group')!;
        const index = parseInt(row.getAttribute('data-index')!, 10);
        groups.find(g => g.name === groupName)!.contacts.splice(index, 1);
        saveToStorage(groups);
        renderMainGroups();
        e.stopPropagation();
        return;
      }
    }

    const header = target.closest('.group-header');
    if (header) {
      const card = header.closest('.main-group')!;
      const name = card.getAttribute('data-name')!;
      const panel = card.querySelector('.contacts-panel')!;
      const arrow = card.querySelector('.arrow-icon')!;
      const expanded = expandedGroups.has(name);

      if (expanded) {
        expandedGroups.delete(name);
        header.classList.remove('expanded');
        arrow.classList.remove('rotated');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        requestAnimationFrame(() => { panel.style.maxHeight = '0'; });
      } else {
        expandedGroups.add(name);
        header.classList.add('expanded');
        arrow.classList.add('rotated');
        panel.style.display = 'block';
        const scrollHeight = panel.scrollHeight;
        panel.style.maxHeight = '0';
        requestAnimationFrame(() => { panel.style.maxHeight = scrollHeight + 'px'; });
        panel.addEventListener('transitionend', () => {
          if (expandedGroups.has(name)) panel.style.maxHeight = 'none';
        }, { once: true });
      }
      e.stopPropagation();
      return;
    }
  });
}

[add_contact_button, add_contact_header_button].filter(Boolean).forEach(btn => btn!.addEventListener('click', (e) => { e.stopPropagation(); toggleAddContactMenu(); }));
[group_button_desktop].filter(Boolean).forEach(btn => btn!.addEventListener('click', (e) => { e.stopPropagation(); toggleGroupsMenu(); }));

setGroups(loadFromStorage());
renderMainGroups();

(window as any).renderMainGroups = renderMainGroups;
(window as any).showGroupsMenu = showGroupsMenu;
(window as any).hideGroupsMenu = hideGroupsMenu;

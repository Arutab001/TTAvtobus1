import { groups, expandedGroups } from '../core/state.js';
import { sanitizePhoneInput, isValidPhone, markInvalid, clearInvalid } from '../core/validation.js';
import { saveToStorage } from '../core/storage.js';
import { showSuccessToast } from './toast.js';
import { CustomDropdown } from './dropdown.js';
export function openDeleteContactModal(groupName, index) {
    const group = groups.find(g => g.name === groupName);
    if (!group || index < 0 || index >= group.contacts.length)
        return;
    const contact = group.contacts[index];
    if (document.querySelector('.modal-overlay'))
        return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    <h4>Удалить контакт</h4>
    <p>Удалить контакт "${contact.name}" из группы "${groupName}"?</p>
    <div class="modal-actions">
      <button id="modal-cancel">Отмена</button>
      <button id="modal-confirm" class="danger">Удалить</button>
    </div>
  `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    modal.querySelector('#modal-cancel')?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay)
        close(); });
    modal.querySelector('#modal-confirm')?.addEventListener('click', () => {
        group.contacts.splice(index, 1);
        saveToStorage(groups);
        close();
        // перерисовать оба списка, если открыты
        const rerenderMain = window.renderMainGroups;
        rerenderMain?.();
        if (document.querySelector('.groups-menu-overlay')) {
            const hide = window.hideGroupsMenu;
            const show = window.showGroupsMenu;
            hide?.();
            show?.();
        }
        showSuccessToast('Контакт удалён');
    });
}
export function startInlineEdit(row, groupName, index) {
    const group = groups.find(g => g.name === groupName);
    if (!group || index < 0 || index >= group.contacts.length)
        return;
    const contact = group.contacts[index];
    if (row.classList.contains('editing'))
        return;
    row.classList.add('editing');
    const nameSpan = row.querySelector('.contact-name');
    const numberSpan = row.querySelector('.contact-number');
    if (!nameSpan || !numberSpan)
        return;
    const originalName = nameSpan.textContent || '';
    const originalNumber = numberSpan.textContent || '';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = originalName;
    nameInput.className = 'inline-input name-input';
    const numberInput = document.createElement('input');
    numberInput.type = 'tel';
    numberInput.value = originalNumber;
    numberInput.className = 'inline-input number-input';
    if (window.IMask) {
        window.IMask(numberInput, { mask: '+{7} (000) 000-00-00' });
    }
    else {
        numberInput.addEventListener('input', () => {
            const caret = numberInput.selectionStart || 0;
            const before = numberInput.value;
            numberInput.value = sanitizePhoneInput(numberInput.value);
            const delta = before.length - numberInput.value.length;
            numberInput.selectionStart = numberInput.selectionEnd = Math.max(0, caret - delta);
        });
    }
    nameSpan.replaceWith(nameInput);
    numberSpan.replaceWith(numberInput);
    // dropdown for group change
    const actions = row.querySelector('.contact-actions');
    let dd;
    if (actions) {
        const ddWrap = document.createElement('div');
        ddWrap.className = 'inline-dd-wrap';
        actions.parentElement?.insertBefore(ddWrap, actions);
        dd = new CustomDropdown(ddWrap);
        dd.dataItems(groups.map(g => g.name), groupName);
    }
    const finish = () => {
        row.classList.remove('editing');
    };
    const applyChanges = () => {
        const newName = nameInput.value.trim();
        const newNumberSan = sanitizePhoneInput(numberInput.value.trim());
        let error = false;
        if (!newName) {
            markInvalid(nameInput, 'Поле не должно быть пустым');
            error = true;
        }
        else {
            clearInvalid(nameInput);
        }
        if (!newNumberSan || !isValidPhone(newNumberSan)) {
            markInvalid(numberInput, 'Только цифры, допустимы + в начале и скобки');
            error = true;
        }
        else {
            clearInvalid(numberInput);
        }
        if (error)
            return false;
        // apply name/number
        contact.name = newName;
        contact.number = newNumberSan;
        // move to another group if changed
        const nextGroupName = dd?.value || groupName;
        if (nextGroupName !== groupName) {
            const src = groups.find(g => g.name === groupName);
            const dst = groups.find(g => g.name === nextGroupName);
            if (dst) {
                // remove from src, push to dst
                const moved = src.contacts.splice(index, 1)[0];
                if (moved)
                    dst.contacts.push(moved);
            }
        }
        saveToStorage(groups);
        const newNameSpan = document.createElement('span');
        newNameSpan.className = 'contact-name';
        newNameSpan.textContent = contact.name;
        const newNumberSpan = document.createElement('span');
        newNumberSpan.className = 'contact-number';
        newNumberSpan.textContent = contact.number;
        nameInput.replaceWith(newNameSpan);
        numberInput.replaceWith(newNumberSpan);
        finish();
        showSuccessToast('Контакт обновлён');
        return true;
    };
    const revertChanges = () => {
        const newNameSpan = document.createElement('span');
        newNameSpan.className = 'contact-name';
        newNameSpan.textContent = originalName;
        const newNumberSpan = document.createElement('span');
        newNumberSpan.className = 'contact-number';
        newNumberSpan.textContent = originalNumber;
        nameInput.replaceWith(newNameSpan);
        numberInput.replaceWith(newNumberSpan);
        finish();
    };
    let blurTimer;
    const scheduleApplyOnBlur = () => {
        if (blurTimer)
            window.clearTimeout(blurTimer);
        blurTimer = window.setTimeout(() => {
            const active = document.activeElement;
            if (active !== nameInput && active !== numberInput) {
                applyChanges();
            }
        }, 0);
    };
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyChanges();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            revertChanges();
        }
    });
    numberInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyChanges();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            revertChanges();
        }
    });
    nameInput.addEventListener('blur', scheduleApplyOnBlur);
    numberInput.addEventListener('blur', scheduleApplyOnBlur);
    nameInput.focus();
}
//# sourceMappingURL=inline-edit.js.map
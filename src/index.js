"use strict";
const groups_list = document.getElementById("groups");
const groups_button = document.querySelector(".group-button button");
let groups = [];
let isGroupsMenuOpen = false;
// Функция для отображения меню групп
function toggleGroupsMenu() {
    isGroupsMenuOpen = !isGroupsMenuOpen;
    if (isGroupsMenuOpen) {
        showGroupsMenu();
    }
    else {
        hideGroupsMenu();
    }
}
function showGroupsMenu() {
    const menuHTML = `
    <div class="groups-menu">
      <h3>Группы контактов</h3>
      ${groups.length === 0 ?
        '<p class="empty-groups">Групп пока нет</p>' :
        groups.map(group => `
          <div class="group-item">
            <span>${group.name} (${group.contacts.length})</span>
          </div>
        `).join('')}
      <button id="add-group-btn">Добавить группу</button>
    </div>
  `;
    // Создаем меню справа
    const menu = document.createElement('div');
    menu.className = 'groups-menu-overlay';
    menu.innerHTML = menuHTML;
    document.body.appendChild(menu);
    // Добавляем обработчик для добавления группы
    const addGroupBtn = menu.querySelector('#add-group-btn');
    if (addGroupBtn) {
        addGroupBtn.addEventListener('click', addGroup);
    }
}
function hideGroupsMenu() {
    const menu = document.querySelector('.groups-menu-overlay');
    if (menu) {
        menu.remove();
    }
}
function addGroup() {
    const groupName = prompt('Введите название группы:');
    if (groupName) {
        const newGroup = {
            name: groupName,
            contacts: []
        };
        groups.push(newGroup);
        hideGroupsMenu();
        showGroupsMenu(); // Обновляем меню
    }
}
// Обработчик клика на кнопку "Группы"
if (groups_button) {
    groups_button.addEventListener('click', toggleGroupsMenu);
}
if (groups.length == 0) {
    groups_list.innerHTML = `<p class="empty-list">Список контактов пуст</p>`;
}
//# sourceMappingURL=index.js.map
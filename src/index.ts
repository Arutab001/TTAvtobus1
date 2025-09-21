const groups_list = document.getElementById("groups");

interface contact {
  name: string;
  number: string;
}

interface group {
  name: string;
  contacts: contact[];
}

let groups: group[] = [];



if (groups.length == 0) {
  groups_list.innerHTML = `<p>Список контактов пуст</p>`;
} 

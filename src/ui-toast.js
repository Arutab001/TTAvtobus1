export function showSuccessToast(text) {
    const existing = document.querySelector('.notification.notification--success');
    if (existing)
        existing.remove();
    const toast = document.createElement('div');
    toast.className = 'notification notification--success';
    toast.innerHTML = `
    <img class="notification__icon" src="./svg/success.svg" alt="success"/>
    <span class="notification__text">${text}</span>
  `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('notification--visible'));
    setTimeout(() => {
        toast.classList.remove('notification--visible');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
//# sourceMappingURL=ui-toast.js.map
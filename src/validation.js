export function sanitizePhoneInput(raw) {
    let value = raw.replace(/[^0-9()+]/g, '');
    const hadPlus = /^\+/.test(raw);
    value = value.replace(/\+/g, '');
    if (hadPlus)
        value = '+' + value.replace(/^\+/, '');
    value = value.replace(/\+(?=.)/g, '');
    return value;
}
export function isValidPhone(value) {
    return /^\+?[0-9()]+$/.test(value) && /[0-9]/.test(value);
}
export function markInvalid(input, message) {
    input.classList.add('invalid');
    let msg = input.parentElement?.querySelector('.field-error');
    if (!msg && input.parentElement) {
        msg = document.createElement('div');
        msg.className = 'field-error';
        input.parentElement.appendChild(msg);
    }
    if (msg)
        msg.textContent = message;
}
export function clearInvalid(input) {
    input.classList.remove('invalid');
    const msg = input.parentElement?.querySelector('.field-error');
    if (msg)
        msg.textContent = '';
}
//# sourceMappingURL=validation.js.map
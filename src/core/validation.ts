export function sanitizePhoneInput(raw: string): string {
  let value = raw.replace(/[^0-9()+]/g, '');
  const hadPlus = /^\+/.test(raw);
  value = value.replace(/\+/g, '');
  if (hadPlus) value = '+' + value.replace(/^\+/, '');
  value = value.replace(/\+(?=.)/g, '');
  return value;
}

export function isValidPhone(value: string): boolean {
  return /^\+?[0-9()]+$/.test(value) && /[0-9]/.test(value);
}

export function markInvalid(input: HTMLInputElement, message: string): void {
  input.classList.add('invalid');
  let msg = input.parentElement?.querySelector('.field-error') as HTMLElement | null;
  if (!msg && input.parentElement) {
    msg = document.createElement('div');
    msg.className = 'field-error';
    input.parentElement.appendChild(msg);
  }
  if (msg) msg.textContent = message;
}

export function clearInvalid(input: HTMLInputElement): void {
  input.classList.remove('invalid');
  const msg = input.parentElement?.querySelector('.field-error');
  if (msg) msg.textContent = '';
}



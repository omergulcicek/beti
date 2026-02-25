export function validateTCKN(value: string): boolean {
  if (!value || value.length !== 11) return false;
  if (!/^[1-9][0-9]{10}$/.test(value)) return false;

  const digits = value.split('').map(Number);
  const d = digits;

  const sumOdd = d[0] + d[2] + d[4] + d[6] + d[8];
  const sumEven = d[1] + d[3] + d[5] + d[7];

  const tenth = ((sumOdd * 7 - sumEven) % 10 + 10) % 10;
  const eleventh = (d[0] + d[1] + d[2] + d[3] + d[4] + d[5] + d[6] + d[7] + d[8] + d[9]) % 10;

  return d[9] === tenth && d[10] === eleventh;
}

export function validateLuhn(value: string): boolean {
  if (!value) return false;
  const sanitized = value.replace(/\D/g, '');

  if (sanitized.startsWith('34') || sanitized.startsWith('37')) {
    if (sanitized.length !== 15) return false;
  } else {
    if (sanitized.length !== 16) return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
}

export function validateEmail(value: string): boolean {
  if (!value || value.length < 5) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(value);
}

export function validateExpiry(value: string): boolean {
  if (!value || value.length !== 4) return false;
  const mm = parseInt(value.slice(0, 2), 10);
  const yy = parseInt(value.slice(2, 4), 10);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
}

export function validateDate(value: string, format: 'DMY' | 'MDY' | 'YMD' = 'DMY'): boolean {
  if (!value || value.length !== 8) return false;

  let dd, mm, yyyy;

  if (format === 'DMY') {
    dd = parseInt(value.slice(0, 2), 10);
    mm = parseInt(value.slice(2, 4), 10);
    yyyy = parseInt(value.slice(4, 8), 10);
  } else if (format === 'MDY') {
    mm = parseInt(value.slice(0, 2), 10);
    dd = parseInt(value.slice(2, 4), 10);
    yyyy = parseInt(value.slice(4, 8), 10);
  } else if (format === 'YMD') {
    yyyy = parseInt(value.slice(0, 4), 10);
    mm = parseInt(value.slice(4, 6), 10);
    dd = parseInt(value.slice(6, 8), 10);
  } else {
    return false;
  }

  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;
  
  const date = new Date(yyyy, mm - 1, dd);
  return date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd;
}

export function validateIBAN(value: string): boolean {
  const fullIban = ('TR' + value.replace(/\D/g, '')).replace(/\s/g, '');
  if (fullIban.length !== 26 || !/^TR[0-9]{24}$/.test(fullIban)) return false;
  const rearranged = fullIban.slice(4) + fullIban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => (c.charCodeAt(0) - 55).toString());
  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + parseInt(numeric[i], 10)) % 97;
  }
  return remainder === 1;
}

export function validateURL(value: string): boolean {
  if (!value) return false;
  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/.*)?$/;
  return urlRegex.test(value);
}

export function validateVKN(value: string): boolean {
  if (!value || value.length !== 10) return false;
  if (!/^[0-9]{10}$/.test(value)) return false;

  const digits = value.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const digit = digits[i];
    const n1 = (digit + (9 - i)) % 10;
    const n2 = (n1 * Math.pow(2, 9 - i)) % 9;
    const n3 = (n1 !== 0 && n2 === 0) ? 9 : n2;
    sum += n3;
  }

  const lastDigit = (10 - (sum % 10)) % 10;
  return digits[9] === lastDigit;
}

export const VALIDATORS: Record<string, (value: string, ...args: any[]) => boolean> = {
  tckn: validateTCKN,
  luhn: validateLuhn,
  email: validateEmail,
  expiry: validateExpiry,
  date: validateDate,
  iban: validateIBAN,
  url: validateURL,
  vkn: validateVKN,
};

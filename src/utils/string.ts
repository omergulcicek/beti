export const slugify = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export function cleanValue(value: string, allowedChars?: RegExp, forbiddenChars?: RegExp): string {
  let cleaned = value;
  if (forbiddenChars) {
    cleaned = cleaned.replace(forbiddenChars, '');
  }
  if (allowedChars) {
    cleaned = cleaned.split('').filter(c => allowedChars.test(c)).join('');
  }
  return cleaned;
}

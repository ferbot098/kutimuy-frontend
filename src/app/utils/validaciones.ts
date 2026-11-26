export const PASSWORD_MIN_LENGTH = 8;

export const MENSAJE_PASSWORD =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un signo';

export function esSoloLetras(valor: string): boolean {
  return /^[\p{L}]+(?:[\s'’-][\p{L}]+)*$/u.test(valor.trim());
}

export function esPasswordSegura(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /\p{Lu}/u.test(password) &&
    /\p{Ll}/u.test(password) &&
    /[^\p{L}\p{N}\s]/u.test(password)
  );
}

export function limpiarNombre(valor: string): string {
  return valor
    .replace(/[^\p{L}\s'’-]/gu, '')
    .replace(/\s{2,}/g, ' ');
}

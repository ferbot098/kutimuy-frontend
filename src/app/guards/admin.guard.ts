import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  // Intentar leer el usuario o el rol almacenado en sesión
  const usuarioRaw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const rolDirecto = localStorage.getItem('rol') || sessionStorage.getItem('rol');

  let rol: string | null = rolDirecto;

  if (!rol && usuarioRaw) {
    try {
      const usuario = JSON.parse(usuarioRaw);
      rol = usuario.rol || null;
    } catch {
      rol = null;
    }
  }

  // Si tiene el rol de ADMINISTRADOR, permite el paso
  if (rol && rol.toUpperCase() === 'ADMINISTRADOR') {
    return true;
  }

  // Si no tiene permiso, muestra la alerta y redirige a /inicio
  alert('Solo el administrador puede ingresar al modulo de usuarios');
  return router.createUrlTree(['/inicio']);
};
import { Component, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface MenuItem {
  etiqueta: string;
  ruta: string;
  soloAdministrador?: boolean;
}

const MENU_PRINCIPAL: MenuItem[] = [
  { etiqueta: 'Inicio', ruta: '/inicio' },
  { etiqueta: 'Clientes', ruta: '/clientes' },
  { etiqueta: 'Cabañas', ruta: '/cabanas' },
  { etiqueta: 'Reservas', ruta: '/reservas' },
  { etiqueta: 'Eventos', ruta: '/eventos' },
  { etiqueta: 'Pagos', ruta: '/pagos' }
];

const MENU_EXTRA: MenuItem[] = [
  { etiqueta: 'Espacios', ruta: '/espacios' },
  { etiqueta: 'Servicios', ruta: '/servicios' },
  { etiqueta: 'Solicitudes', ruta: '/solicitudes' },
  { etiqueta: 'Cotizaciones', ruta: '/cotizaciones' },
  { etiqueta: 'Canales de origen', ruta: '/canales', soloAdministrador: true },
  { etiqueta: 'Tipos de evento', ruta: '/tipos-evento', soloAdministrador: true },
  { etiqueta: 'Usuarios', ruta: '/usuarios', soloAdministrador: true }
];

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

  protected readonly usuario = signal<{ nombre: string; rol: string } | null>(null);

  protected readonly rol: string;

  protected readonly menuPrincipal: MenuItem[];

  protected readonly menuExtra: MenuItem[];

  protected readonly menuAbierto = signal(false);

  constructor(private router: Router) {

    const datos = localStorage.getItem('usuario');

    if (datos) {
      try {
        this.usuario.set(JSON.parse(datos));
      } catch {
        this.usuario.set(null);
      }
    }

    this.rol = this.usuario()?.rol ?? '';

    this.menuPrincipal = MENU_PRINCIPAL.filter(item => this.puedeVer(item));
    this.menuExtra = MENU_EXTRA.filter(item => this.puedeVer(item));
  }

  private puedeVer(item: MenuItem): boolean {
    return !item.soloAdministrador || this.rol === 'ADMINISTRADOR';
  }

  alternarMenu(): void {
    this.menuAbierto.update(valor => !valor);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  @HostListener('document:click')
  cerrarMenuPorClic(): void {
    this.menuAbierto.set(false);
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
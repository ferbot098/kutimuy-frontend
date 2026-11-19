import { Routes } from '@angular/router';

import { Inicio } from './components/inicio/inicio';
import { Login } from './components/login/login';
import { Layout } from './components/layout/layout';
import { Usuario } from './components/crear-usuario/crear-usuario';
import { Clientes } from './components/clientes/clientes';
import { Cabanas } from './components/cabanas/cabanas';
import { Espacios } from './components/espacios/espacios';
import { Reservas } from './components/reservas/reservas';
import { Eventos } from './components/eventos/eventos';
import { Servicios } from './components/servicios/servicios';
import { Pagos } from './components/pagos/pagos';
import { Solicitudes } from './components/solicitudes/solicitudes';
import { Cotizaciones } from './components/cotizaciones/cotizaciones';
import { Canales } from './components/canales/canales';
import { TiposEvento } from './components/tipos-evento/tipos-evento';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [

  // LOGIN
  {
    path: 'login',
    component: Login
  },

  // APLICACIÓN PRINCIPAL
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [

      // Página principal
      {
        path: 'inicio',
        component: Inicio
      },

      // 01 - Usuarios (Solo accesible para ADMINISTRADOR)
      {
        path: 'usuarios',
        component: Usuario,
        canActivate: [adminGuard]
      },

      // 02 - Clientes
      {
        path: 'clientes',
        component: Clientes
      },

      // 03 - Cabañas
      {
        path: 'cabanas',
        component: Cabanas
      },

      // 04 - Espacios
      {
        path: 'espacios',
        component: Espacios
      },

      // 05 - Reservas
      {
        path: 'reservas',
        component: Reservas
      },

      // 06 - Eventos
      {
        path: 'eventos',
        component: Eventos
      },

      // 07 - Servicios
      {
        path: 'servicios',
        component: Servicios
      },

      // 08 - Pagos
      {
        path: 'pagos',
        component: Pagos
      },

      // 09 - Solicitudes
      {
        path: 'solicitudes',
        component: Solicitudes
      },

      // 10 - Cotizaciones
      {
        path: 'cotizaciones',
        component: Cotizaciones
      },

      // 11 - Canales de origen
      {
        path: 'canales',
        component: Canales
      },

      // 12 - Tipos de evento
      {
        path: 'tipos-evento',
        component: TiposEvento
      },

      // Si entran directamente a /
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }

    ]
  },

  // Cualquier ruta inexistente
  {
    path: '**',
    redirectTo: 'login'
  }

];
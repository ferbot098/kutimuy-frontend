import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideBrowserGlobalErrorListeners,
  inject,
  NgZone,
  ApplicationRef
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

// Interceptor global: fuerza a Angular a repintar la UI de inmediato
// al completarse cualquier petición HTTP en cualquier módulo de la web.
const autoRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const zone = inject(NgZone);
  const appRef = inject(ApplicationRef);

  return next(req).pipe(
    tap({
      next: () => {
        setTimeout(() => {
          zone.run(() => appRef.tick());
        }, 0);
      },
      error: () => {
        setTimeout(() => {
          zone.run(() => appRef.tick());
        }, 0);
      }
    })
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, autoRefreshInterceptor])
    )
  ]
};

import { ApplicationConfig, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { routes } from './app.routes';
// import { LicenseInterceptor } from './core/services/license.interceptor';
import { LicenseHeaderInterceptor } from './core/services/license-header.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(),              // sin withEventReplay
  // provideHttpClient(withInterceptors([LicenseInterceptor])),
  provideHttpClient(withInterceptors([LicenseHeaderInterceptor])),
  { provide: LOCALE_ID, useValue: 'es-AR' },
  { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
};

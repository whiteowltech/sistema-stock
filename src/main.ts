import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';
import localeEsAR from '@angular/common/locales/es-AR';
import { App } from './app/app';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEsAR);
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

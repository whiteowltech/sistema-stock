import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';
import { App } from './app/app';
import { appConfig } from './app/app.config';

registerLocaleData(localeEsAR);
bootstrapApplication(App, appConfig).catch(err => console.error(err));

import { ApplicationConfig, inject, LOCALE_ID, isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { STORAGE_KEY } from './core/tokens/storage.token';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(withInterceptors([authInterceptor])),

    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },

    {
      provide: STORAGE_KEY,
      useValue: 'solicitacoes',
    },

    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore()),

    provideTranslateService({
      fallbackLang: 'pt-BR',
      lang: 'pt-BR',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
    }),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: 'http://localhost:4000/graphql',
        }),
        cache: new InMemoryCache(),
      };
    }),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

import { HTTP_INTERCEPTORS, HttpBackend, HttpClient } from '@angular/common/http';
import { importProvidersFrom, LOCALE_ID, EnvironmentProviders, Provider } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { WeatherTranslateLoader } from '../../services/locale/translate.loader';
import { localeInterceptor } from '../../interceptors/locale/locale.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';

export enum LOCALES {
    EN = 'en',
    ES = 'es'
}

registerLocaleData(localeEs, 'es');
registerLocaleData(localeEn, 'en');

const DEFAULT_LOCALE = LOCALES.ES;

function localeIdFactory(): string {
    const nav = navigator.language;
    if (nav.startsWith('es')) return LOCALES.ES;
    if (nav.startsWith('en')) return LOCALES.EN;
    return DEFAULT_LOCALE;
}

const httpLoaderFactory = (httpBackend: HttpBackend) => {
    return new WeatherTranslateLoader(
        new HttpClient(httpBackend),
        './assets/i18n/',
        '.json'
    );
};

export function provideLocales(): (Provider | EnvironmentProviders)[] {
    return [
        { provide: LOCALE_ID, useFactory: localeIdFactory },
        { provide: MAT_DATE_LOCALE, useFactory: localeIdFactory },
        provideMomentDateAdapter({
            parse: { dateInput: ['DD/MM/YYYY', 'l', 'LL'] },
            display: {
                dateInput: 'DD/MM/YYYY',
                monthYearLabel: 'MMM YYYY',
                dateA11yLabel: 'LL',
                monthYearA11yLabel: 'MMMM YY'
            }
        }, { useUtc: true }),
        importProvidersFrom(
            TranslateModule.forRoot({
                defaultLanguage: localeIdFactory(),
                loader: {
                    provide: TranslateLoader,
                    useFactory: httpLoaderFactory,
                    deps: [HttpBackend]
                }
            })
        ),
        { provide: HTTP_INTERCEPTORS, useValue: localeInterceptor, multi: true }
    ];
}

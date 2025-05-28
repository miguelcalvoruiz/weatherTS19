import { HttpInterceptorFn } from '@angular/common/http';
import { inject, LOCALE_ID } from '@angular/core';
import { WTS_LOCALE_KEY } from '../../services/locale/locale.service';

/**
 * Interceptor HTTP que añade el encabezado 'Accept-Language' a cada solicitud saliente.
 * Utiliza el idioma predeterminado del navegador.
 */
export const localeInterceptor: HttpInterceptorFn = (req, next) => {
  const defaultLocale = inject(LOCALE_ID);
  const locale = localStorage.getItem(WTS_LOCALE_KEY) || defaultLocale;
  const reqWithHeader = req.clone({
    headers: req.headers.set('Accept-Language', locale)
  });

  return next(reqWithHeader);
};

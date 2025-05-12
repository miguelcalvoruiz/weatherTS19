import { inject, Injectable, InjectionToken, LOCALE_ID, signal } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { EnumType } from 'typescript';

export const WTS_LOCALE_KEY = 'LOCALE_ID';
export const WTS_LOCALES = new InjectionToken<EnumType>('LOCALES');

@Injectable({
  providedIn: 'root'
})
export class LocaleService {

  private _locale = signal(inject(LOCALE_ID));
  private _locales = inject(WTS_LOCALES);
  private _adapter = inject(DateAdapter);
  private _service = inject(TranslateService);

  constructor() {
    this._service.addLangs(Object.values(this._locales));
    const savedLocale = localStorage.getItem(WTS_LOCALE_KEY);
    if (savedLocale) {
      this.changeLocale(savedLocale);
    }
  }

  public get locale() {
    return this._locale.asReadonly();
  }

  public get locales() {
    return this._service.getLangs();
  }

  public changeLocale(locale: string) {
    this._locale.set(locale);
    this._adapter.setLocale(locale);
    this._service.use(locale);
    localStorage.setItem(WTS_LOCALE_KEY, locale);
  }

}

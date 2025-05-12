import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TranslateLoader } from '@ngx-translate/core';

export class WeatherTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix: string = './assets/i18n/',
    private suffix: string = '.json'
  ) { }

  public getTranslation(lang: string): Observable<any> {
    return this.http.get<{ [key: string]: string }>(`${this.prefix}${lang}${this.suffix}`);
  }
}
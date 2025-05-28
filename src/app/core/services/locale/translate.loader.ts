import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TranslateLoader } from '@ngx-translate/core';

/**
 * Cargador personalizado que implementa TranslateLoader para cargar archivos de traducción JSON.
 */
export class WeatherTranslateLoader implements TranslateLoader {

  /**
   * Crea una instancia de WeatherTranslateLoader.
   * @param http - Cliente HTTP para realizar solicitudes.
   * @param prefix - Prefijo de la ruta de los archivos de traducción.
   * @param suffix - Sufijo de la ruta de los archivos de traducción.
   */
  constructor(
    private http: HttpClient,
    private prefix: string = './assets/i18n/',
    private suffix: string = '.json'
  ) { }

  /**
   * Obtiene las traducciones para el idioma especificado.
   * @param lang - Código de idioma.
   * @returns Observable con las traducciones.
   */
  public getTranslation(lang: string): Observable<any> {
    return this.http.get<{ [key: string]: string }>(`${this.prefix}${lang}${this.suffix}`);
  }
}
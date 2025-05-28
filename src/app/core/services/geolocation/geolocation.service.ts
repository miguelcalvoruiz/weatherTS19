import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

/** 
 * Servicio que gestiona la geolocalización.
 * Devuelve la posición actual del usuario a través de un Observable,
 * o un error si la geolocalización no es soportada.
 */
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  private _platformId = inject(PLATFORM_ID);

  /** 
   * Obtiene la posición actual del usuario.
   * @returns Observable<GeolocationPosition> que emite la posición actual.
   */
  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable(observer => {
      if (isPlatformBrowser(this._platformId) && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            observer.next(position);
            observer.complete();
          },
          error => observer.error(error),
          {
            enableHighAccuracy: true
          }
        );
      } else {
        observer.error(new Error('Geolocation not supported'));
      }
    });
  }
}

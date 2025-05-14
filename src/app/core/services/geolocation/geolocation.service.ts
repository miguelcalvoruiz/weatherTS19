import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  private _platformId = inject(PLATFORM_ID);

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

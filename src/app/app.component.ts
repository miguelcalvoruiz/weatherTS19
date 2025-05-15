import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './views/header/header.component';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { GeolocationService } from './core/services/geolocation/geolocation.service';
import { UtilityService } from './core/services/utility/utility.service';
import { CurrentWeatherComponent } from './views/current-weather/current-weather.component';
import { FiveDaysForecastComponent } from './views/five-days-forecast/five-days-forecast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TranslateModule,
    HeaderComponent,
    CurrentWeatherComponent,
    FiveDaysForecastComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  private _geolocationService = inject(GeolocationService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _utilityService = inject(UtilityService);

  loading = signal<boolean>(true);
  private minimumSpinnerDisplayTime = 1000;
  private lastNavigationStart = 0;

  ngOnInit(): void {
    this.loading.set(true);
    this._geolocationService.getCurrentPosition().subscribe({
      next: position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this._router.navigateByUrl(`/weather?lat=${lat}&lon=${lon}`);
      }
    });

    this._route.queryParams.subscribe({
      next: params => {
        const rawLat = params['lat'], rawLon = params['lon'];
        if (rawLat != null && rawLon != null) {
          const lat = parseFloat(rawLat), lon = parseFloat(rawLon);
          if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
            this._utilityService.setCoords(lat, lon);
          }
        }
      }
    });


    this._router.events.subscribe({
      next: event => {
        if (event instanceof NavigationStart) {
          this.loading.set(true);
          this.lastNavigationStart = Date.now();
        }
        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationError ||
          event instanceof NavigationCancel
        ) {
          const navigationTime = Date.now() - this.lastNavigationStart;
          const delay = Math.max(this.minimumSpinnerDisplayTime - navigationTime, 0);
          setTimeout(() => 
            this.loading.set(false), delay
          );
        }
      }
    });
  }
}

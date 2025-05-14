import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './views/header/header.component';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeolocationService } from './core/services/geolocation/geolocation.service';
import { UtilityService } from './core/services/utility/utility.service';
import { CurrentWeatherComponent } from './views/current-weather/current-weather.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TranslateModule,
    HeaderComponent,
    CurrentWeatherComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  private _geolocationService = inject(GeolocationService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _utilityService = inject(UtilityService);

  loading = signal<boolean>(true);
  private minimumSpinnerDisplayTime = 1000;
  private lastNavigationStart = 0;

  private subscription = new Subscription();

  ngOnInit(): void {
    this.loading.set(true);
    this.subscription.add(
      this._geolocationService.getCurrentPosition().subscribe(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this._router.navigateByUrl(`/weather?lat=${lat}&lon=${lon}`);
        },
        error => console.error('Error obtaining position:', error)
      )
    );

    this.subscription.add(
      this._route.queryParams.subscribe(params => {
        const rawLat = params['lat'];
        const rawLon = params['lon'];
        if (rawLat != null && rawLon != null) {
          const lat = parseFloat(rawLat);
          const lon = parseFloat(rawLon);
          if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
            this._utilityService.setCoords(lat, lon);
          }
        }
      })
    );


    this.subscription.add(
      this._router.events.subscribe(event => {
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
          setTimeout(() => {
            this.loading.set(false);
          }, delay);
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

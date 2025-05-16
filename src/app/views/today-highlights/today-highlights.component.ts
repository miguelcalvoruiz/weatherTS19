import { Component, inject, OnInit, signal } from '@angular/core';
import { tap, switchMap } from 'rxjs';
import { UtilityService } from '../../core/services/utility/utility.service';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ParseIntPipe } from '../../core/pipes/parse-int/parse-int.pipe';

@Component({
  selector: 'app-today-highlights',
  imports: [
    CommonModule,
    TranslateModule,
    ParseIntPipe
  ],
  templateUrl: './today-highlights.component.html',
  styleUrl: './today-highlights.component.scss'
})
export class TodayHighlightsComponent implements OnInit {
  private _weatherApi = inject(WeatherApiService);
  public _utility = inject(UtilityService);

  airQuality = signal<{
    aqi: number;
    pm2_5: string;
    so2: string;
    no2: string;
    o3: string;
  } | null>(null);

  sunriseTime = signal('');
  sunsetTime = signal('');
  feelsLike = signal(0);
  visibility = signal<number | null>(null);
  pressure = signal(0);
  humidity = signal(0);

  ngOnInit(): void {
    this._utility.coords$.pipe(
      switchMap(coords =>
        this._weatherApi.getAirPollution(coords!.lat, coords!.lon).pipe(
          tap(air => {
            const { aqi } = air.list[0].main;
            const { pm2_5, so2, no2, o3 } = air.list[0].components;
            this.airQuality.set({
              aqi,
              pm2_5: Number(pm2_5).toPrecision(2),
              so2: Number(so2).toPrecision(2),
              no2: Number(no2).toPrecision(3),
              o3: Number(o3).toPrecision(3)
            });
          }),
          switchMap(() => this._weatherApi.getCurrentWeather(coords!.lat, coords!.lon))
        )
      )
    ).subscribe({
      next: weather => {
        this.sunriseTime.set(
          this._utility.getTime(weather.sys.sunrise, weather.timezone)
        );
        this.sunsetTime.set(
          this._utility.getTime(weather.sys.sunset, weather.timezone)
        );
        this.feelsLike.set(weather.main.feels_like);
        this.visibility.set(weather.visibility / 1000);
        this.pressure.set(weather.main.pressure);
        this.humidity.set(weather.main.humidity);
      }
    });
  }
}

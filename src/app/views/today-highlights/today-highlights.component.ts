import { Component, effect, inject, signal } from '@angular/core';
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
export class TodayHighlightsComponent {
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

  private coordsEffect = effect(() => {
    const coords = this._utility.coords();
    if (!coords) return;

    this._weatherApi.getAirPollution(coords.lat, coords.lon).subscribe(air => {
      const airDetail = air.list[0];
      this.airQuality.set({
        aqi: airDetail.main.aqi,
        pm2_5: Number(airDetail.components.pm2_5).toPrecision(2),
        so2: Number(airDetail.components.so2).toPrecision(2),
        no2: Number(airDetail.components.no2).toPrecision(3),
        o3: Number(airDetail.components.o3).toPrecision(3),
      });
    });

    this._weatherApi.getCurrentWeather(coords.lat, coords.lon).subscribe(weather => {
      this.sunriseTime.set(this._utility.getTime(weather.sys.sunrise, weather.timezone));
      this.sunsetTime.set(this._utility.getTime(weather.sys.sunset, weather.timezone));
      this.feelsLike.set(Math.round(weather.main.feels_like));
      this.visibility.set(Math.round(weather.visibility / 1000));
      this.pressure.set(weather.main.pressure);
      this.humidity.set(weather.main.humidity);
    });
  });
}

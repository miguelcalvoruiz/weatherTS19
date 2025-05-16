import { Component, inject, signal } from '@angular/core';
import { UtilityService } from '../../core/services/utility/utility.service';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ParseIntPipe } from '../../core/pipes/parse-int/parse-int.pipe';
import { CapitalizeFirstWordPipe } from '../../core/pipes/capitalize-first-word/capitalize-first-word.pipe';

@Component({
  selector: 'app-hourly-forecast',
  imports: [
    TranslateModule,
    CommonModule,
    ParseIntPipe,
    CapitalizeFirstWordPipe
  ],
  templateUrl: './hourly-forecast.component.html',
  styleUrl: './hourly-forecast.component.scss'
})
export class HourlyForecastComponent {

  private _weatherApi = inject(WeatherApiService);
  public _utility = inject(UtilityService);

  forecastList = signal<any[]>([]);
  activeTab = signal<'weather'|'wind'>('weather');

  ngOnInit(): void {
    this._utility.coords$.subscribe({
      next: coords => {
        if (!coords) return;
        this._weatherApi.getForecast(coords.lat, coords.lon).subscribe({
          next: forecast => {
            const now = new Date();
            const list = forecast.list
              .filter((it: any) => new Date(it.dt_txt) > now)
              .slice(0, 8)
              .map((it: any) => ({
                dateTime: new Date(it.dt_txt),
                temp: it.main.temp,
                icon: it.weather[0].icon,
                description: it.weather[0].description,
                windDirection: it.wind.deg,
                windSpeed: it.wind.speed,
                probabilityOfRain: it.pop
              }));
            this.forecastList.set(list);
          }
        });
      }
    });
  }

  mpsToKmh(mps: number): number {
    return this._utility.mpsToKmh(mps);
  }

  rainProbability(pop: number): string {
    return this._utility.rainProbability(pop);
  }

  setActiveTab(tab: 'weather'|'wind'): void {
    this.activeTab.set(tab);
  }
}

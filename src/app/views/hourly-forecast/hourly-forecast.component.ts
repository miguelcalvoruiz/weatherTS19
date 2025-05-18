import { Component, effect, inject, signal } from '@angular/core';
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

  private coordsEffect = effect(() => {
    const coords = this._utility.coords();
    if (!coords) return;
    this._weatherApi.getForecast(coords.lat, coords.lon).subscribe(forecast => {
      const now = new Date();
      const list = forecast.list
        .filter((forecastItem: any) => new Date(forecastItem.dt_txt) > now)
        .slice(0, 8)
        .map((forecastItem: any) => ({
          dateTime: new Date(forecastItem.dt_txt),
          temp: forecastItem.main.temp,
          icon: forecastItem.weather[0].icon,
          description: forecastItem.weather[0].description,
          windDirection: forecastItem.wind.deg,
          windSpeed: forecastItem.wind.speed,
          probabilforecastItemyOfRain: forecastItem.pop
        }));
      this.forecastList.set(list);
    });
  });

  mpsToKmh(pop: number) { 
    return this._utility.mpsToKmh(pop); 
  }

  rainProbability(pop: number) { 
    return this._utility.rainProbability(pop);
  }

  setActiveTab(tab : 'weather'|'wind') { 
    this.activeTab.set(tab);
  }
}

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

  /**
   * Lista de pronósticos horarios procesados.
   */
  forecastList = signal<any[]>([]);
  
  /**
   * Pestaña activa del componente: 'weather' o 'wind'.
   */
  activeTab = signal<'weather'|'wind'>('weather');

  /**
   * Efecto que se ejecuta al obtener las coordenadas actuales.
   * Realiza una llamada a la API para obtener el pronóstico y procesa los datos.
   */
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

  /**
   * Convierte la velocidad del viento de metros por segundo a kilómetros por hora,
   * con el servicio de utlity
   * @param speed - Velocidad en m/s.
   * @returns Velocidad en km/h.
   */
  mpsToKmh(pop: number) { 
    return this._utility.mpsToKmh(pop); 
  }

  /**
   * Calcula el porcentaje de probabilidad de lluvia,
   * con el servicio de utility
   * @param pop - Probabilidad (valor entre 0 y 1).
   * @returns Porcentaje de probabilidad de lluvia.
   */
  rainProbability(pop: number) { 
    return this._utility.rainProbability(pop);
  }

  /**
   * Establece la pestaña activa en el componente.
   * @param tab - Pestaña a activar: 'weather' o 'wind'.
   */
  setActiveTab(tab : 'weather'|'wind') { 
    this.activeTab.set(tab);
  }
}

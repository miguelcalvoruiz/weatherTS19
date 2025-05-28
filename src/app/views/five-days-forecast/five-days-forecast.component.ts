import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { UtilityService } from '../../core/services/utility/utility.service';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { TranslateModule } from '@ngx-translate/core';
import { CapitalizeFirstWordPipe } from '../../core/pipes/capitalize-first-word/capitalize-first-word.pipe';
import { CommonModule } from '@angular/common';
import { ParseIntPipe } from '../../core/pipes/parse-int/parse-int.pipe';

@Component({
  selector: 'app-five-days-forecast',
  imports: [
    TranslateModule,
    CapitalizeFirstWordPipe,
    ParseIntPipe,
    CommonModule
  ],
  templateUrl: './five-days-forecast.component.html',
  styleUrl: './five-days-forecast.component.scss'
})
export class FiveDaysForecastComponent {

  private _weatherApi = inject(WeatherApiService);
  private _utility = inject(UtilityService);

  /**
   * Signal que contiene la previsión meteorológica procesada para los próximos 5 días.
   */
  forecasts = signal<any[]>([]);

  /**
   * Efecto reactivo que se activa al cambiar las coordenadas.
   * Obtiene y actualiza la previsión meteorológica procesada.
   */
  private coordsEffect = effect(() => {
    const coords = this._utility.coords();
    if (!coords) return;
    this._weatherApi.getProcessedForecast(coords.lat, coords.lon)
      .subscribe(data => this.forecasts.set(data));
  });
}
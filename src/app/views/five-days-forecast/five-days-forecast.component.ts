import { Component, inject, OnInit, signal } from '@angular/core';
import { UtilityService } from '../../core/services/utility/utility.service';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { Observable, filter, switchMap, catchError, of, Subscription } from 'rxjs';
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
export class FiveDaysForecastComponent implements OnInit {

  private _weatherApi = inject(WeatherApiService);
  private _utility = inject(UtilityService);

  forecasts = signal<any[]>([]);

  ngOnInit(): void {
    this._utility.coords$.subscribe({
      next: coords => {
        if (!coords) return;
        this._weatherApi.getProcessedForecast(coords.lat, coords.lon).subscribe({
          next: data => {
            this.forecasts.set(data);
          }
        });
      }
    })
  }

}
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UtilityService } from '../utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherApiService {
  private readonly apiKey = '7d3fe649c8b8c8d3615e21ef94ebb141';
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly geoApiUrl = 'https://api.openweathermap.org/geo/1.0';

  private _http = inject(HttpClient);
  private _utility = inject(UtilityService)

  private commonParams(): HttpParams {
    return new HttpParams()
      .set('appid', this.apiKey)
      .set('lang', navigator.language.split('-')[0]);
  }

  getCurrentWeather(lat: number, lon: number): Observable<any> {
    const url = `${this.apiUrl}/weather`;
    const params = this.commonParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('units', 'metric');
    return this._http.get<any>(url, { params });
  }

  getForecast(lat: number, lon: number): Observable<any> {
    const url = `${this.apiUrl}/forecast`;
    const params = this.commonParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('units', 'metric');

    return this._http.get<any>(url, { params });
  }

  getProcessedForecast(lat: number, lon: number): Observable<any[]> {
    return this.getForecast(lat, lon).pipe(
      map(data => {
        const now = new Date();
        now.setHours(now.getHours(), 0, 0, 0);
        const currentHour = now.getHours();

        const nextDays = Array.from({ length: 5 }, (_, i) => {
          const date = new Date(now);
          date.setDate(now.getDate() + i + 1);
          return date.toISOString().split('T')[0];
        });

        return nextDays.map(dateStr => {
          const list = data.list.filter((f: any) => f.dt_txt.startsWith(dateStr));
          if (!list.length) return null;
          const closest = list.reduce((p: any, c: any) => {
            const previousHour = new Date(p.dt_txt).getHours();
            const currentHourInReading = new Date(c.dt_txt).getHours();
            return Math.abs(currentHourInReading - currentHour) < Math.abs(previousHour - currentHour) ? c : p;
          });
          
          const { temp_max } = closest.main;
          const { icon, description } = closest.weather[0];
          const forecastDate = new Date(closest.dt_txt);
          const dayOfWeek = this._utility.getDate(forecastDate.getTime()/1000 - forecastDate.getTimezoneOffset()*60, 0).split(' ')[0];

          return { 
            temp_max, 
            icon, 
            description, 
            date: forecastDate, 
            dayOfWeek 
          };
        }).filter(f => f !== null) as any[];
      })
    );
  }

  getAirPollution(lat: number, lon: number): Observable<any> {
    const url = `${this.apiUrl}/air_pollution`;
    const params = this.commonParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString());
      
    return this._http.get<any>(url, { params });
  }

  getReverseGeo(lat: number, lon: number, limit = 5): Observable<any> {
    const url = `${this.geoApiUrl}/reverse`;
    const params = this.commonParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('limit', limit.toString());
      
    return this._http.get<any>(url, { params });
  }

  getGeo(query: string, limit = 5): Observable<any> {
    const url = `${this.geoApiUrl}/direct`;
    const params = this.commonParams()
      .set('q', query)
      .set('limit', limit.toString());
      
    return this._http.get<any>(url, { params });
  }
}

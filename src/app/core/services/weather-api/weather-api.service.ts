import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherApiService {
  private readonly apiKey = '7d3fe649c8b8c8d3615e21ef94ebb141';
  private readonly apiUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly geoApiUrl = 'https://api.openweathermap.org/geo/1.0';

  private _http = inject(HttpClient);

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

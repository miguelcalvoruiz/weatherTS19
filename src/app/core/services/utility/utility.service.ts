import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { WeatherVideos } from '../../models/weather-videos';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private translate = inject(TranslateService);

  private coordsSubject = new BehaviorSubject<{ lat: number; lon: number } | null>(null);
  coords$ = this.coordsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private weekDayKeys = [
    'utility.days.sunday',
    'utility.days.monday',
    'utility.days.tuesday',
    'utility.days.wednesday',
    'utility.days.thursday',
    'utility.days.friday',
    'utility.days.saturday',
  ] as const;

  private monthKeys = [
    'utility.months.january',
    'utility.months.february',
    'utility.months.march',
    'utility.months.april',
    'utility.months.may',
    'utility.months.june',
    'utility.months.july',
    'utility.months.august',
    'utility.months.september',
    'utility.months.october',
    'utility.months.november',
    'utility.months.december',
  ] as const;

  private videos: WeatherVideos = {
    Clear: 'clear-day.webm',
    Clouds: 'cloudy.webm',
    Rain: 'rainy.webm',
    Drizzle: 'rainy.webm',
    Thunderstorm: 'thunderstorm.webm',
    Snow: 'snowy-day.webm',
    Mist: 'haze.webm',
    Smoke: 'haze.webm',
    Haze: 'haze.webm',
    Dust: 'dust.webm',
    Fog: 'haze.webm',
    Sand: 'haze.webm',
    Ash: 'haze.webm',
    Squall: 'rainy.webm',
    Tornado: 'tornado.webm',
  };

  private readonly apiTextMap: Record<number, { level: string; message: string }> = {
    1: {
      level: 'utility.air-quality.level.good',
      message: 'utility.air-quality.message.good',
    },
    2: {
      level: 'utility.air-quality.level.fair',
      message: 'utility.air-quality.message.fair',
    },
    3: {
      level: 'utility.air-quality.level.moderate',
      message: 'utility.air-quality.message.moderate',
    },
    4: {
      level: 'utility.air-quality.level.poor',
      message: 'utility.air-quality.message.poor',
    },
    5: {
      level: 'utility.air-quality.level.very.poor',
      message: 'utility.air-quality.message.very.poor',
    },
  };

  setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }

  setCoords(lat: number, lon: number): void {
    if (!isNaN(lat) && !isNaN(lon)) {
      this.coordsSubject.next({ lat, lon });
    } else {
      console.error('Coordenadas no válidas');
    }
  }

  getDate(dateUnix: number, timezone: number): string {
    const offset = new Date().getTimezoneOffset() * 60;
    const date = new Date((dateUnix + timezone + offset) * 1000);
    const dayKey = this.weekDayKeys[date.getUTCDay()];
    const monthKey = this.monthKeys[date.getUTCMonth()];
    const dayName = this.translate.instant(dayKey);
    const monthName = this.translate.instant(monthKey);
    return `${dayName} ${date.getUTCDate()}, ${monthName}`;
  }

  getTime(timeUnix: number, timezone: number): string {
    const date = new Date((timeUnix + timezone) * 1000);
    let hours = date.getUTCHours();
    const mins = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${ampm}`;
  }

  getHours(timeUnix: number, timezone: number): string {
    const date = new Date((timeUnix + timezone) * 1000);
    let hours = date.getUTCHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours} ${ampm}`;
  }

  mpsToKmh(mps: number): number {
    return (mps * 3600) / 1000;
  }

  rainProbability(pop: number): string {
    const prob = Math.round((pop * 100) / 5) * 5;
    return `${prob}%`;
  }

  getApiText(level: number): { level: string; message: string } {
    const txt = this.apiTextMap[level] ?? { level: '', message: '' };
    return {
      level: this.translate.instant(txt.level),
      message: this.translate.instant(txt.message),
    };
  }

  getBackgroundVideo(condition: string): string {
    return this.videos[condition] ?? 'cloudy.webm';
  }
}

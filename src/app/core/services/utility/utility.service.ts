import { inject, Injectable, signal, Signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { API_TEXT_MAP } from '../../constants/air-quality.constants';
import { MONTH_KEYS, WEEK_DAY_KEYS } from '../../constants/date.constants';
import { WEATHER_VIDEOS } from '../../constants/videos.constants';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private translate = inject(TranslateService);

  private readonly coordsSignal = signal<{ lat: number; lon: number } | null>(null);
  readonly coords: Signal<{ lat: number; lon: number } | null> = this.coordsSignal.asReadonly();

  private weekDayKeys = WEEK_DAY_KEYS;
  private monthKeys = MONTH_KEYS;
  private videos = WEATHER_VIDEOS;
  private apiTextMap = API_TEXT_MAP;
  
  setCoords(lat: number, lon: number): void {
    if (!isNaN(lat) && !isNaN(lon)) {
      this.coordsSignal.set({ lat, lon });
    } else {
      console.error('Invalid coordinates');
    }
  }

  getDate(dateUnix: number, timezone: number): string {
    const localOffsetSec = new Date().getTimezoneOffset() * 60;
    const utcTimestampSec = dateUnix + timezone + localOffsetSec;
    const date = new Date(utcTimestampSec * 1000);

    const dayKey   = this.weekDayKeys[date.getUTCDay()];
    const monthKey = this.monthKeys[date.getUTCMonth()];
    const dayName  = this.translate.instant(dayKey);
    const monthName= this.translate.instant(monthKey);

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

  mpsToKmh(mps: number): number {
    return +(mps * 3.6).toFixed(1);
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
    return this.videos[condition] ?? this.videos['Clouds'];
  }
}

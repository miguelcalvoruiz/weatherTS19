import { inject, Injectable, signal, Signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { API_TEXT_MAP } from '../../constants/air-quality.constants';
import { MONTH_KEYS, WEEK_DAY_KEYS } from '../../constants/date.constants';
import { WEATHER_VIDEOS } from '../../constants/videos.constants';

/**
 * Servicio que proporciona utilidades para la aplicación, como gestionar
 * coordenadas geográficas, formatear fechas y convertir unidades.
 */
@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private translate = inject(TranslateService);

  // Señal para almacenar las coordenadas geográficas (de solo lectura para componentes)
  private readonly coordsSignal = signal<{ lat: number; lon: number } | null>(null);
  readonly coords: Signal<{ lat: number; lon: number } | null> = this.coordsSignal.asReadonly();

  private weekDayKeys = WEEK_DAY_KEYS;
  private monthKeys = MONTH_KEYS;
  private videos = WEATHER_VIDEOS;
  private apiTextMap = API_TEXT_MAP;
  
  /**
   * Establece las coordenadas actuales.
   * @param lat - Latitud.
   * @param lon - Longitud.
   */
  setCoords(lat: number, lon: number): void {
    if (!isNaN(lat) && !isNaN(lon)) {
      this.coordsSignal.set({ lat, lon });
    } else {
      console.error('Invalid coordinates');
    }
  }

  /**
   * Formatea una fecha Unix a un string legible en el formato "Day D, Month".
   * @param dateUnix - Fecha en formato Unix.
   * @param timezone - Zona horaria en segundos.
   * @returns Cadena formateada.
   */
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

  /**
   * Convierte una marca de tiempo Unix a una hora formateada (ej. 6:45 AM).
   * @param timeUnix - Marca de tiempo Unix.
   * @param timezone - Zona horaria en segundos.
   * @returns Hora formateada.
   */
  getTime(timeUnix: number, timezone: number): string {
    const date = new Date((timeUnix + timezone) * 1000);
    let hours = date.getUTCHours();
    const mins = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${ampm}`;
  }

  /**
   * Convierte metros por segundo a kilómetros por hora.
   * @param mps - Velocidad en m/s.
   * @returns Velocidad en km/h.
   */
  mpsToKmh(mps: number): number {
    return +(mps * 3.6).toFixed(1);
  }

  /**
   * Calcula la probabilidad de lluvia en porcentaje.
   * @param pop - Probabilidad de lluvia (valor entre 0 y 1).
   * @returns Probabilidad con el símbolo de porcentaje.
   */
  rainProbability(pop: number): string {
    const prob = Math.round((pop * 100) / 5) * 5;
    return `${prob}%`;
  }

  /**
   * Obtiene el texto asociado al nivel de calidad del aire.
   * @param level - Nivel de calidad del aire.
   * @returns Objeto con propiedades level y message.
   */
  getAqiText(level: number): { level: string; message: string } {
    const txt = this.apiTextMap[level] ?? { level: '', message: '' };
    return {
      level: this.translate.instant(txt.level),
      message: this.translate.instant(txt.message),
    };
  }

  /**
   * Devuelve el nombre del video de fondo en función de la condición meteorológica.
   * @param condition - Condición meteorológica.
   * @returns Nombre del archivo de video.
   */
  getBackgroundVideo(condition: string): string {
    return this.videos[condition] ?? this.videos['Clouds'];
  }
}

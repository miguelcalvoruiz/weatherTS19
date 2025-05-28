import { AfterViewInit, Component, effect, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { UtilityService } from '../../core/services/utility/utility.service';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { CapitalizeFirstWordPipe } from '../../core/pipes/capitalize-first-word/capitalize-first-word.pipe';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Componente que muestra el clima actual y reproduce un video de fondo
 * basado en el clima
 */
@Component({
  selector: 'app-current-weather',
  imports: [
    CapitalizeFirstWordPipe,
    TranslateModule
  ],
  templateUrl: './current-weather.component.html',
  styleUrl: './current-weather.component.scss'
})
export class CurrentWeatherComponent implements AfterViewInit, OnDestroy {

  // Inyecta el servicio para obtener datos meteorológicos.
  private _weatherApi = inject(WeatherApiService);
  // Inyecta el servicio de utilidades para funciones auxiliares.
  private _utility = inject(UtilityService);

  // Señal que contiene los datos actuales del clima.
  currentWeatherData = signal<any | null>(null);
  // Señal que contiene el nombre del video de fondo.
  backgroundVideo = signal<any | null>('');
  // Señal que indica si el video se está reproduciendo.
  isVideoPlaying = signal<any | null>(false);

  /**
   * Referencia al elemento de video en la plantilla.
   */
  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  /**
   * Efecto que se activa al cambiar las coordenadas y actualiza
   * los datos del clima y el video de fondo.
   */
  private coordsEffect = effect(() => {
    const coords = this._utility.coords();
    if (!coords) return;

    this._weatherApi
      .getCurrentWeather(coords.lat, coords.lon)
      .subscribe((data) => {
        this.currentWeatherData.set({
          name: data.name,
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          date: this._utility.getDate(data.dt, data.timezone),
          location: `${data.name}, ${data.sys.country}`,
        });
        this.backgroundVideo.set(
          this._utility.getBackgroundVideo(data.weather[0].main)
        );
        if (this.videoElement) {
          this.loadAndPlayVideo();
        }
      });
  });

  /**
   * Se ejecuta después de que la vista ha sido inicializada.
   * Añade listeners para manejar la visibilidad de la página y
   * reproduce el video si está disponible.
   */
  ngAfterViewInit() {
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('focus', this.onVisibility);
    if (this.backgroundVideo()) {
      this.loadAndPlayVideo();
    }
  }

  /**
   * Se ejecuta al destruir el componente.
   * Elimina los listeners y destruye el efecto de coordenadas.
   */
  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('focus', this.onVisibility);
    this.coordsEffect.destroy();
  }

  /**
   * Maneja los cambios de visibilidad de la página para reproducir
   * el video si es necesario.
   */
  private onVisibility = () => {
    if (
      document.visibilityState === 'visible' &&
      !this.isVideoPlaying() &&
      this.videoElement
    ) {
      this.videoElement.nativeElement.play().catch(() => { });
    }
  };

  /**
   * Carga y reproduce el video de fondo basado en las condiciones meteorológicas.
   */
  private loadAndPlayVideo() {
    const video = this.videoElement.nativeElement;
    video.src = `assets/img/animations/${this.backgroundVideo()}`;
    video.load();
    video
      .play()
      .then(() => this.isVideoPlaying.set(true))
      .catch(() => { });
  }

  /**
   * Se ejecuta cuando el video puede reproducirse.
   * Inicia la reproducción del video.
   */
  onCanPlay() {
    this.videoElement.nativeElement.play().then(() => {
      this.isVideoPlaying.set(true);
    }).catch(() => { });
  }

}

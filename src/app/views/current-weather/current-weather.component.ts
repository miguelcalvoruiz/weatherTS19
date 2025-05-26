import { AfterViewInit, Component, effect, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { UtilityService } from '../../core/services/utility/utility.service';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { CapitalizeFirstWordPipe } from '../../core/pipes/capitalize-first-word/capitalize-first-word.pipe';
import { TranslateModule } from '@ngx-translate/core';

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
  private _weatherApi = inject(WeatherApiService);
  private _utility = inject(UtilityService);

  currentWeatherData = signal<any | null>(null);
  backgroundVideo = signal<any | null>('');
  isVideoPlaying = signal<any | null>(false);

  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

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

  ngAfterViewInit() {
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('focus', this.onVisibility);
    if (this.backgroundVideo()) {
      this.loadAndPlayVideo();
    }
  }
  
  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('focus', this.onVisibility);
    this.coordsEffect.destroy();
  }

  private onVisibility = () => {
    if (
      document.visibilityState === 'visible' &&
      !this.isVideoPlaying() &&
      this.videoElement
    ) {
      this.videoElement.nativeElement.play().catch(() => {});
    }
  };

  private loadAndPlayVideo() {
    const video = this.videoElement.nativeElement;
    video.src = `assets/img/animations/${this.backgroundVideo()}`;
    video.load();
    video
      .play()
      .then(() => this.isVideoPlaying.set(true))
      .catch(() => {});
  }

  onCanPlay() {
    this.videoElement.nativeElement.play().then(() => {
      this.isVideoPlaying.set(true);
    }).catch(() => {});
  }
  
}
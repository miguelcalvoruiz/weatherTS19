import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { UtilityService } from '../../core/services/utility/utility.service';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { CapitalizeFirstWordPipe } from '../../core/pipes/capitalize-first-word/capitalize-first-word.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
  private weatherApi = inject(WeatherApiService);
  private utility = inject(UtilityService);

  currentWeatherData = signal<any | null>(null);
  backgroundVideo = signal<any | null>('');
  isVideoPlaying = signal<any | null>(false);

  private coordsSub!: Subscription;

  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  private handleUserInteraction = this.onUserInteraction.bind(this);
  private handleVisibilityChange = this.onVisibilityChange.bind(this);
  private handleWindowFocus = this.onWindowFocus.bind(this);

  ngAfterViewInit(): void {
    this.coordsSub = this.utility.coords$.subscribe(coords => {
      if (coords) {
        this.updateWeather(coords.lat, coords.lon);
      }
    });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleWindowFocus);
    window.addEventListener('click', this.handleUserInteraction);
  }

  ngOnDestroy(): void {
    this.coordsSub.unsubscribe();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('click', this.handleUserInteraction);
  }

  private updateWeather(lat: number, lon: number): void {
    this.weatherApi.getCurrentWeather(lat, lon).subscribe(data => {
      this.currentWeatherData.set({
        name: data.name,
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        date: this.utility.getDate(data.dt, data.timezone),
        location: `${data.name}, ${data.sys.country}`
      });
      const condition = data.weather[0].main;
      this.backgroundVideo.set(this.utility.getBackgroundVideo(condition));
      setTimeout(() => this.loadAndPlayVideo(), 0);
    });
  }

  private loadAndPlayVideo(): void {
    const videoEl = this.videoElement?.nativeElement;
    if (!videoEl) return;

    videoEl.src = `assets/img/animations/${this.backgroundVideo()}`;
    videoEl.load();
    videoEl.oncanplaythrough = () => {
      videoEl.play()
        .then(() => this.isVideoPlaying.set(true))
        .catch(error => console.error('Error playing video:', error));
    };
  }

  private onUserInteraction(): void {
    if (!this.isVideoPlaying()) {
      this.loadAndPlayVideo();
    }
  }

  private onVisibilityChange(): void {
    if (document.visibilityState === 'visible' && !this.isVideoPlaying()) {
      this.loadAndPlayVideo();
    }
  }

  private onWindowFocus(): void {
    if (!this.isVideoPlaying()) {
      this.loadAndPlayVideo();
    }
  }
}

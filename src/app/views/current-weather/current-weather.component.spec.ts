import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurrentWeatherComponent } from './current-weather.component';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { UtilityService } from '../../core/services/utility/utility.service';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('CurrentWeatherComponent', () => {
  let component: CurrentWeatherComponent;
  let fixture: ComponentFixture<CurrentWeatherComponent>;

  const mockWeatherApiService = {
    getCurrentWeather: jasmine.createSpy('getCurrentWeather').and.returnValue(of({
      name: 'Madrid',
      main: { temp: 25 },
      weather: [{ description: 'cielo despejado', icon: '01d', main: 'Clear' }],
      dt: 1620000000,
      timezone: 7200,
      sys: { country: 'ES' }
    }))
  };

  const mockUtilityService = {
    coords: jasmine.createSpy('coords').and.returnValue({ lat: 40.4168, lon: -3.7038 }),
    getDate: jasmine.createSpy('getDate').and.returnValue('2025-05-26'),
    getBackgroundVideo: jasmine.createSpy('getBackgroundVideo').and.returnValue('clear-day.webm')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CurrentWeatherComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WeatherApiService, useValue: mockWeatherApiService },
        { provide: UtilityService, useValue: mockUtilityService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentWeatherComponent);
    component = fixture.componentInstance;
    component.videoElement = new ElementRef(document.createElement('video'));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentWeatherData correctly', () => {
    const data = component.currentWeatherData();
    expect(data).toBeTruthy();
    expect(data.temp).toBe(25);
    expect(data.description).toBe('cielo despejado');
    expect(data.location).toBe('Madrid, ES');
  });

  it('should set backgroundVideo correctly', () => {
    const video = component.backgroundVideo();
    expect(video).toBe('clear-day.webm');
  });

  it('should set isVideoPlaying to true when calling onCanPlay', () => {
    spyOn(component.videoElement.nativeElement, 'play').and.returnValue(Promise.resolve());
    component.onCanPlay();
    fixture.whenStable().then(() => {
      expect(component.isVideoPlaying()).toBeTrue();
    });
  });
});
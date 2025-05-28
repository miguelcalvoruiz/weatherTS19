import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TodayHighlightsComponent } from './today-highlights.component';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { UtilityService } from '../../core/services/utility/utility.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ParseIntPipe } from '../../core/pipes/parse-int/parse-int.pipe';
import { signal, WritableSignal } from '@angular/core';

describe('TodayHighlightsComponent', () => {
  let component: TodayHighlightsComponent;
  let fixture: ComponentFixture<TodayHighlightsComponent>;
  let mockWeatherApiService: jasmine.SpyObj<WeatherApiService>;
  let coordsSignal: WritableSignal<{ lat: number; lon: number } | null>;
  let fakeUtilityService: {
    coords: WritableSignal<{ lat: number; lon: number } | null>;
    getTime: jasmine.Spy;
    getApiText: jasmine.Spy;
  };

  beforeEach(waitForAsync(() => {
    mockWeatherApiService = jasmine.createSpyObj('WeatherApiService', ['getAirPollution', 'getCurrentWeather']);
    coordsSignal = signal<{ lat: number; lon: number } | null>(null);
    fakeUtilityService = {
      coords: coordsSignal,
      getTime: jasmine.createSpy('getTime'),
      getApiText: jasmine.createSpy('getApiText')
    };

    fakeUtilityService.getApiText.and.callFake((aqi: number) => ({
      level: `Level${aqi}`,
      message: `Message for AQI ${aqi}`
    }));

    TestBed.configureTestingModule({
      imports: [
        TodayHighlightsComponent,
        TranslateModule.forRoot(),
        CommonModule,
        ParseIntPipe
      ],
      providers: [
        { provide: WeatherApiService, useValue: mockWeatherApiService },
        { provide: UtilityService, useValue: fakeUtilityService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayHighlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch air quality and current weather when coords set', () => {

    const mockAirResponse = {
      list: [
        {
          main: { aqi: 3 },
          components: { pm2_5: 12.34, so2: 5.67, no2: 8.90, o3: 15.2 }
        }
      ]
    };
    mockWeatherApiService.getAirPollution.and.returnValue(of(mockAirResponse));

    const mockWeatherResponse = {
      sys: { sunrise: 1620000000, sunset: 1620050000 },
      main: { feels_like: 18.7, pressure: 1013, humidity: 65 },
      visibility: 8000,
      timezone: 7200
    };
    mockWeatherApiService.getCurrentWeather.and.returnValue(of(mockWeatherResponse));

    (fakeUtilityService.getTime as jasmine.Spy).and.callFake((timeUnix: number, tz: number) => {
      if (timeUnix === mockWeatherResponse.sys.sunrise) return '06:00 AM';
      if (timeUnix === mockWeatherResponse.sys.sunset) return '08:00 PM';
      return '';
    });

    const mockCoords = { lat: 40.4168, lon: -3.7038 };
    coordsSignal.set(mockCoords);
    fixture.detectChanges();

    const aq = component.airQuality();
    expect(aq).toBeTruthy();
    expect(aq!.aqi).toBe(3);
    expect(aq!.pm2_5).toBe('12');
    expect(aq!.so2).toBe('5.7');
    expect(aq!.no2).toBe('8.90');
    expect(aq!.o3).toBe('15.2');

    expect(component.sunriseTime()).toBe('06:00 AM');
    expect(component.sunsetTime()).toBe('08:00 PM');

    expect(component.feelsLike()).toBe(Math.round(mockWeatherResponse.main.feels_like));
    expect(component.pressure()).toBe(1013);
    expect(component.humidity()).toBe(65);
    expect(component.visibility()).toBe(Math.round(mockWeatherResponse.visibility / 1000));

    const badgeEl = fixture.nativeElement.querySelector('.badge');
    expect(badgeEl.textContent).toContain('Level3');
    expect(badgeEl.getAttribute('title')).toContain('Message for AQI 3');
  });
});

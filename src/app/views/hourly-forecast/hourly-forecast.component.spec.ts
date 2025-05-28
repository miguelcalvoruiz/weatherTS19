import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HourlyForecastComponent } from './hourly-forecast.component';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { UtilityService } from '../../core/services/utility/utility.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ParseIntPipe } from '../../core/pipes/parse-int/parse-int.pipe';
import { CapitalizeFirstWordPipe } from '../../core/pipes/capitalize-first-word/capitalize-first-word.pipe';
import { signal, WritableSignal } from '@angular/core';

describe('HourlyForecastComponent', () => {
  let component: HourlyForecastComponent;
  let fixture: ComponentFixture<HourlyForecastComponent>;
  let mockWeatherApiService: jasmine.SpyObj<WeatherApiService>;
  let coordsSignal: WritableSignal<{ lat: number; lon: number } | null>;
  let fakeUtilityService: {
    coords: WritableSignal<{ lat: number; lon: number } | null>;
    mpsToKmh: jasmine.Spy;
    rainProbability: jasmine.Spy;
  };

  beforeEach(waitForAsync(() => {
    mockWeatherApiService = jasmine.createSpyObj('WeatherApiService', ['getForecast']);
    coordsSignal = signal<{ lat: number; lon: number } | null>(null);
    fakeUtilityService = {
      coords: coordsSignal,
      mpsToKmh: jasmine.createSpy('mpsToKmh'),
      rainProbability: jasmine.createSpy('rainProbability')
    };

    TestBed.configureTestingModule({
      imports: [
        HourlyForecastComponent,
        TranslateModule.forRoot(),
        CommonModule,
        ParseIntPipe,
        CapitalizeFirstWordPipe
      ],
      providers: [
        { provide: WeatherApiService, useValue: mockWeatherApiService },
        { provide: UtilityService, useValue: fakeUtilityService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HourlyForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set active tab to "wind"', () => {
    component.setActiveTab('wind');
    expect(component.activeTab()).toBe('wind');
  });

  it('should fetch and set forecast data', () => {
    const mockCoords = { lat: 48.8566, lon: 2.3522 };
    const mockForecastData = {
      list: [
        {
          dt_txt: new Date(Date.now() + 3600_000).toISOString(),
          main: { temp: 20 },
          weather: [{ icon: '01d', description: 'clear sky' }],
          wind: { deg: 180, speed: 5 },
          pop: 0.2
        },
        {
          dt_txt: new Date(Date.now() + 2 * 3600_000).toISOString(),
          main: { temp: 22 },
          weather: [{ icon: '02d', description: 'few clouds' }],
          wind: { deg: 190, speed: 6 },
          pop: 0.4
        }
      ]
    };

    mockWeatherApiService.getForecast.and.returnValue(of(mockForecastData));
    fakeUtilityService.mpsToKmh.and.callFake((speed: number) => speed * 3.6);
    fakeUtilityService.rainProbability.and.callFake((pop: number) => `${Math.round(pop * 100)}%`);

    coordsSignal.set(mockCoords);
    fixture.detectChanges();
    expect(component.forecastList().length).toBe(2);
    expect(component.forecastList()[0].temp).toBe(20);
    expect(component.forecastList()[1].description).toBe('few clouds');
  });
});

import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { GeolocationService } from './core/services/geolocation/geolocation.service';
import { UtilityService } from './core/services/utility/utility.service';
import { WeatherApiService } from './core/services/weather-api/weather-api.service';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, NavigationCancel } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './views/header/header.component';
import { CurrentWeatherComponent } from './views/current-weather/current-weather.component';
import { FiveDaysForecastComponent } from './views/five-days-forecast/five-days-forecast.component';
import { TodayHighlightsComponent } from './views/today-highlights/today-highlights.component';
import { HourlyForecastComponent } from './views/hourly-forecast/hourly-forecast.component';
import { signal, Signal, WritableSignal } from '@angular/core';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  let mockGeolocationService: jasmine.SpyObj<GeolocationService>;
  let stubUtilityService: {
    coords: Signal<{ lat: number; lon: number } | null>;
    setCoords: jasmine.Spy;
  };

  let routerEvents$: Subject<any>;
  let mockRouter: Partial<Router>;

  let queryParams$: Subject<any>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(waitForAsync(() => {
    mockGeolocationService = jasmine.createSpyObj('GeolocationService', ['getCurrentPosition']);

    routerEvents$ = new Subject();
    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
      events: routerEvents$.asObservable()
    };

    queryParams$ = new Subject();
    mockActivatedRoute = {
      queryParams: queryParams$.asObservable()
    };

    const fakePosition = { coords: { latitude: 10, longitude: 20 } } as GeolocationPosition;
    mockGeolocationService.getCurrentPosition.and.returnValue(of(fakePosition));

    const coordsSignal: WritableSignal<{ lat: number; lon: number } | null> = signal(null);
    stubUtilityService = {
      coords: coordsSignal,
      setCoords: jasmine.createSpy('setCoords')
    };

    const stubWeatherApiService = {};

    TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslateModule.forRoot(),
        HeaderComponent,
        CurrentWeatherComponent,
        FiveDaysForecastComponent,
        TodayHighlightsComponent,
        HourlyForecastComponent
      ],
      providers: [
        { provide: GeolocationService, useValue: mockGeolocationService },
        { provide: UtilityService, useValue: stubUtilityService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: WeatherApiService, useValue: stubWeatherApiService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call geolocation and navigate on init', () => {
    expect(mockGeolocationService.getCurrentPosition).toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/weather?lat=10&lon=20');
  });

  it('should set coords when queryParams emit valid lat/lon', fakeAsync(() => {
    queryParams$.next({ lat: '30.5', lon: '40.7' });
    tick();
    fixture.detectChanges();

    expect(stubUtilityService.setCoords).toHaveBeenCalledWith(30.5, 40.7);

    stubUtilityService.setCoords.calls.reset();
    queryParams$.next({ lat: 'invalid', lon: 'value' });
    tick();
    fixture.detectChanges();
    expect(stubUtilityService.setCoords).not.toHaveBeenCalled();
  }));

  it('should show and hide loading spinner on router events', fakeAsync(() => {
    expect(component.loading()).toBeTrue();

    routerEvents$.next(new NavigationStart(1, '/path'));
    fixture.detectChanges();
    expect(component.loading()).toBeTrue();

    routerEvents$.next(new NavigationEnd(1, '/path', '/path'));
    tick(500);
    fixture.detectChanges();
    expect(component.loading()).toBeTrue();

    tick(500);
    fixture.detectChanges();
    expect(component.loading()).toBeFalse();

    routerEvents$.next(new NavigationStart(2, '/another'));
    fixture.detectChanges();
    expect(component.loading()).toBeTrue();

    routerEvents$.next(new NavigationCancel(2, '/another', 'cancelled'));
    tick(1000);
    fixture.detectChanges();
    expect(component.loading()).toBeFalse();
  }));
});

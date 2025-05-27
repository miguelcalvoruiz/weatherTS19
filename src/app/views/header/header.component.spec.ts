import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockWeatherApiService: jasmine.SpyObj<WeatherApiService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockWeatherApiService = jasmine.createSpyObj('WeatherApiService', ['getGeo']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        TranslateModule.forRoot(),
        FormsModule,
        CommonModule
      ],
      providers: [
        { provide: WeatherApiService, useValue: mockWeatherApiService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display search results correctly', fakeAsync(() => {
    const mockLocations = [
      { name: 'Paris', state: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
      { name: 'Lyon', state: 'Auvergne-Rhône-Alpes', country: 'France', lat: 45.7640, lon: 4.8357 }
    ];
    mockWeatherApiService.getGeo.and.returnValue(of(mockLocations));

    component.searchTerm.set('Par');
    component.search();
    tick(50);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.view-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Paris');
    expect(items[1].textContent).toContain('Lyon');
  }));

  it('should clear search results when clearSearchResults is called', () => {
    component.searchTerm.set('Test');
    component.searchResults.set([{ name: 'Test City' }]);
    component.searching.set(true);

    component.clearSearchResults();
    fixture.detectChanges();

    expect(component.searchTerm()).toBe('');
    expect(component.searchResults().length).toBe(0);
    expect(component.searching()).toBeFalse();
  });

  it('should navigate to weather page on location click', () => {
    const mockEvent = new Event('click');
    spyOn(mockEvent, 'preventDefault');

    const lat = 48.8566;
    const lon = 2.3522;

    component.navigateToWeather(lat, lon, mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/weather'], { queryParams: { lat, lon } });
  });
});

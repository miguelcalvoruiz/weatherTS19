import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiveDaysForecastComponent } from './five-days-forecast.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CapitalizeFirstWordPipe } from '../../core/pipes/capitalize-first-word/capitalize-first-word.pipe';
import { ParseIntPipe } from '../../core/pipes/parse-int/parse-int.pipe';
import { CommonModule } from '@angular/common';

 describe('FiveDaysForecastComponent', () => {
  let component: FiveDaysForecastComponent;
  let fixture: ComponentFixture<FiveDaysForecastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FiveDaysForecastComponent,
        TranslateModule.forRoot(),
        CapitalizeFirstWordPipe,
        ParseIntPipe,
        CommonModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FiveDaysForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display forecast data correctly', () => {
    const mockForecasts = [
      {
        icon: '01d',
        description: 'Clear sky',
        temp_max: 25,
        date: new Date('2025-05-26'),
        dayOfWeek: 'Monday'
      }
    ];

    component.forecasts.set(mockForecasts);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const forecastItems = compiled.querySelectorAll('.card-item');
    expect(forecastItems.length).toBe(1);

    const temperature = forecastItems[0].querySelector('.title-2')?.textContent;
    expect(temperature).toContain('25');

    const date = forecastItems[0].querySelectorAll('.label-1')[0]?.textContent;
    expect(date).toContain('26 May');

    const dayOfWeek = forecastItems[0].querySelectorAll('.label-1')[1]?.textContent;
    expect(dayOfWeek).toContain('Monday');
  });
});
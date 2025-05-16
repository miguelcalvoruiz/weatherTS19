import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayHighlightsComponent } from './today-highlights.component';

describe('TodayHighlightsComponent', () => {
  let component: TodayHighlightsComponent;
  let fixture: ComponentFixture<TodayHighlightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayHighlightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayHighlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

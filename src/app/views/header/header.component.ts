import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherApiService } from '../../core/services/weather-api/weather-api.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [
    TranslateModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  searchTerm   = signal('');
  searchResults = signal<any[]>([]);
  searching    = signal(false);
  private searchTimeout: any;
  private _weatherApi = inject(WeatherApiService);
  private _router = inject(Router)

  toggleSearch(): void {
    this.searching.update(prev => !prev);
  }

  search(): void {
    clearTimeout(this.searchTimeout);
    const term = this.searchTerm();
    if (!term) {
      this.clearSearchResults();
      return;
    }

    this.searching.set(true);
    this.searchTimeout = setTimeout(() => {
      this._weatherApi.getGeo(term).subscribe({
        next: (loc) => {
          this.searchResults.set(loc);
        },
        error: () => {
          this.searchResults.set([]);
        }
      });
    }, 50);
  }

  clearSearchResults(): void {
    this.searchTerm.set('');
    this.searchResults.set([]);
    this.searching.set(false);
  }
  
  navigateToWeather(lat: number, lon: number, event: Event): void {
    event.preventDefault();
    this.clearSearchResults();
    this._router.navigate(['/weather'], { queryParams: { lat, lon } });
  }
}

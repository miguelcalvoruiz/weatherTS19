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
  /**
   * Término de búsqueda introducido por el usuario.
   */
  searchTerm = signal('');
  /**
   * Resultados de búsqueda obtenidos de la API.
   */
  searchResults = signal<any[]>([]);
  /**
   * Indica si se está mostrando el campo de búsqueda.
   */
  searching = signal(false);
  /**
   * Referencia al temporizador para controlar el debounce de la búsqueda.
   */
  private _searchTimeout: any;
  /**
   * Inyeccion de servicios para obtener datos meteorológicos,
   * y el enrutamiento para navegar entre vistas
   */
  private _weatherApi = inject(WeatherApiService);
  private _router = inject(Router)

  /**
   * Alterna la visibilidad del campo de búsqueda.
   */
  toggleSearch(): void {
    this.searching.update(prev => !prev);
  }

  /**
   * Realiza una búsqueda de ubicaciones basada en el término introducido.
   * Utiliza un debounce para evitar múltiples llamadas a la API en rápida sucesión.
   */
  search(): void {
    clearTimeout(this._searchTimeout);
    const term = this.searchTerm();
    if (!term) {
      this.clearSearchResults();
      return;
    }

    this.searching.set(true);
    this._searchTimeout = setTimeout(() => {
      this._weatherApi.getGeo(term).subscribe({
        next: (locations) => {
          this.searchResults.set(locations);
        },
        error: () => {
          this.searchResults.set([]);
        }
      });
    }, 50);    
  }

  /**
   * Limpia los resultados de búsqueda y restablece el estado del campo de búsqueda.
   */
  clearSearchResults(): void {
    this.searchTerm.set('');
    this.searchResults.set([]);
    this.searching.set(false);
  }

  /**
   * Navega a la vista del clima para las coordenadas seleccionadas.
   * @param lat - Latitud de la ubicación seleccionada.
   * @param lon - Longitud de la ubicación seleccionada.
   * @param event - Evento del clic para prevenir el comportamiento por defecto.
   */
  navigateToWeather(lat: number, lon: number, event: Event): void {
    event.preventDefault();
    this.clearSearchResults();
    this._router.navigate(['/weather'], { queryParams: { lat, lon } });
  }
}

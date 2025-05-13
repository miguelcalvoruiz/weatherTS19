import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './views/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TranslateModule,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'weatherTS-app';
}

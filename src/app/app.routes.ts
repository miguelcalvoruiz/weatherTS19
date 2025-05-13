import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
    { path: 'current-location', component: AppComponent },
    { path: '', redirectTo: '/current-location', pathMatch: 'full' },
    { path: '**', component: AppComponent }
];

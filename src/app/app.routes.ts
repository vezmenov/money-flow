import { Routes } from '@angular/router';
import { CategoriesComponent } from './pages/categories/categories.component';
import { DashboardsComponent } from './pages/dashboards/dashboards.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'dashboards', component: DashboardsComponent },
  { path: '**', redirectTo: '' },
];

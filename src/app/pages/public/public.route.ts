import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const PublicRoutes: Routes = [
  {
    path: '',
    redirectTo: 'Login',
    pathMatch: 'full',
  },
  {
    path: 'Login',
    component: LoginComponent,
  },
];

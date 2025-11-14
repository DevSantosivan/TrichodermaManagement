import { Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/public/public.route').then((m) => m.PublicRoutes),
  },
  {
    path: 'admin',

    loadChildren: () =>
      import('./pages/admin/admin.route').then((m) => m.AdminRoutes),
  },
];

@NgModule({
  exports: [RouterModule],
})
export class AppRoutingModule {}

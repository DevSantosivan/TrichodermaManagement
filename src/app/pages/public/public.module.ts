import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';

import { PublicRoutes } from './public.route';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(PublicRoutes),
    LoginComponent, // standalone component imported
  ],
})
export class PublicModule {}

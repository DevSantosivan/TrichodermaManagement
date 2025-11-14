import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './overview/overview.component';
import { CropsComponent } from './crops/crops.component';
import { AdminRoutes } from './admin.route';
import { AccountPreferencesComponent } from './account-preferences/account-preferences.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(AdminRoutes),
    OverviewComponent, // ✅ import standalone component
    CropsComponent, // ✅ import standalone component
    DashboardComponent, // ✅ import standalone component
    AccountPreferencesComponent,
  ],
})
export class AdminModule {}

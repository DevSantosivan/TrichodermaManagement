import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './overview/overview.component';

import { WaterGuideComponent } from './water-guide/water-guide.component';
import { VideoTutorialComponent } from './video-tutorial/video-tutorial.component';
import { CropsComponent } from './crops/crops.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },

      { path: 'overview', component: OverviewComponent },
      { path: 'crop', component: CropsComponent },
      { path: 'watering-guide', component: WaterGuideComponent },
      { path: 'video-tutorial', component: VideoTutorialComponent },

      // ✅ Correct path to your folder structure
      {
        path: 'account-preferences',
        loadComponent: () =>
          import('./account-preferences/account-preferences.component').then(
            (m) => m.AccountPreferencesComponent
          ),
      },
    ],
  },
];

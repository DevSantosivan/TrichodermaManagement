import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './overview/overview.component';

import { WaterGuideComponent } from './water-guide/water-guide.component';
import { VideoTutorialComponent } from './video-tutorial/video-tutorial.component';
import { CropsComponent } from './crops/crops.component';
import { AddCropComponent } from './add-crop/add-crop.component';
import { RemidersAdminComponent } from './remiders-admin/remiders-admin.component';
import { ChatComponent } from './chat/chat.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { FarmerAccountsComponent } from './farmer-accounts/farmer-accounts.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },

      { path: 'overview', component: OverviewComponent },
      { path: 'crop', component: CropsComponent },
      { path: 'crop/add', component: AddCropComponent },
      { path: 'crop/edit/:id', component: AddCropComponent },
      { path: 'watering-guide', component: RemidersAdminComponent },
      { path: 'video-tutorial', component: VideoTutorialComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'chat/:userId', component: ChatBoxComponent },
      { path: 'accounts', component: FarmerAccountsComponent },
      { path: 'profile/:id', component: UserProfileComponent },

      // ✅ Correct path to your folder structure
      {
        path: 'account-preferences',
        loadComponent: () =>
          import('./account-preferences/account-preferences.component').then(
            (m) => m.AccountPreferencesComponent,
          ),
      },
    ],
  },
];

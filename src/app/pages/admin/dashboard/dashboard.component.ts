import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CropService } from '../../../service/crop.service';
import { VideoService } from '../../../service/video-tutorial.service';
import { WaterGuideService } from '../../../service/water-guide.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  constructor(
    private cropService: CropService,
    private videoService: VideoService,
    private waterService: WaterGuideService,
    private router: Router
  ) {}

  /** NAVBAR TOGGLE ---------------------------------------- */
  isMenuOpen = false;
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  profileOpen = false;

  toggleProfileMenu() {
    this.profileOpen = !this.profileOpen;
  }

  closeProfileMenu() {
    this.profileOpen = false;
  }

  /** SEARCH MODAL ---------------------------------------- */
  searchOpen = false;
  searchQuery = '';

  results = {
    crops: [] as any[],
    videos: [] as any[],
    guides: [] as any[],
  };

  showEmpty = false;

  openSearchModal() {
    this.searchOpen = true;
  }

  closeSearchModal() {
    this.searchOpen = false;
    this.searchQuery = '';
    this.results = { crops: [], videos: [], guides: [] };
    this.showEmpty = false;
  }

  async handleSearch() {
    const q = this.searchQuery.trim().toLowerCase();

    if (!q) {
      this.results = { crops: [], videos: [], guides: [] };
      this.showEmpty = false;
      return;
    }

    const [crops, videos, guides] = await Promise.all([
      this.cropService.getCrops(),
      this.videoService.getVideos(),
      this.waterService.getGuides(),
    ]);

    this.results.crops = crops.filter(
      (c) =>
        c.title_en.toLowerCase().includes(q) ||
        c.title_tl.toLowerCase().includes(q) ||
        c.description_en.toLowerCase().includes(q) ||
        c.description_tl.toLowerCase().includes(q)
    );

    this.results.videos = videos.filter((v) =>
      v.title.toLowerCase().includes(q)
    );

    this.results.guides = guides.filter((g) =>
      g.description.toLowerCase().includes(q)
    );

    this.showEmpty =
      this.results.crops.length === 0 &&
      this.results.videos.length === 0 &&
      this.results.guides.length === 0;
  }

  /** NAVIGATION ------------------------------------------ */
  goToCrop(crop: any) {
    this.router.navigate(['/dashboard/crop'], {
      queryParams: { id: crop.id },
    });
    this.closeSearchModal();
  }

  goToVideo(video: any) {
    this.router.navigate(['/dashboard/video-tutorial'], {
      queryParams: { id: video.id },
    });
    this.closeSearchModal();
  }

  goToGuide(guide: any) {
    this.router.navigate(['/dashboard/watering-guide'], {
      queryParams: { id: guide.id },
    });
    this.closeSearchModal();
  }

  /** LOGOUT ---------------------------------------------- */
  onLogout() {
    this.router.navigate(['/']);
  }
}

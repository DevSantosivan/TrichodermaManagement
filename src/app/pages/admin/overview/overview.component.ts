import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { CropService } from '../../../service/crop.service';
import { VideoService } from '../../../service/video-tutorial.service';

import { Crop } from '../../../model/crop.model';
import { Video } from '../../../model/video.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overview.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class OverviewComponent implements OnInit {
  // ================= DATA =================
  crops: Crop[] = [];
  videos: Video[] = [];

  loading = false;
  isGridView = false;
  searchText = '';

  // ================= SUMMARY =================
  trichodermaPrice = 0;
  lastUpdated = new Date();
  totalVideos = 0; // ✅ REAL COUNT
  totalFarmers = 57; // sample

  safeBg: SafeStyle;

  constructor(
    private sanitizer: DomSanitizer,
    private cropService: CropService,
    private videoService: VideoService, // ✅ INJECT VIDEO SERVICE
  ) {
    const imageUrl =
      'https://th.bing.com/th/id/R.4180531fe234fb34545caae63f173b64';
    this.safeBg = this.sanitizer.bypassSecurityTrustStyle(`url('${imageUrl}')`);
  }

  // ================= TOAST =================
  toast = {
    show: false,
    message: '',
    type: '' as 'loading' | 'success' | 'error',
  };

  showToast(
    message: string,
    type: 'loading' | 'success' | 'error' = 'success',
  ) {
    this.toast = { show: true, message, type };

    if (type !== 'loading') {
      setTimeout(() => (this.toast.show = false), 2500);
    }
  }

  hideToast() {
    this.toast.show = false;
  }

  // ================= PRICE MODAL =================
  showPriceModal = false;
  newPrice = 0;

  openEditPriceModal() {
    this.newPrice = this.trichodermaPrice;
    this.showPriceModal = true;
  }

  closePriceModal() {
    this.showPriceModal = false;
  }

  async updatePrice() {
    if (!this.newPrice || this.newPrice <= 0) return;

    try {
      this.showToast('Updating price...', 'loading');

      await this.cropService.saveTrichodermaPrice(this.newPrice);

      this.trichodermaPrice = this.newPrice;
      this.lastUpdated = new Date();
      this.showPriceModal = false;

      this.showToast(
        `Price updated successfully: ₱${this.newPrice.toFixed(2)}`,
        'success',
      );
    } catch (error) {
      console.error('❌ Failed to save price:', error);
      this.showToast('Failed to update price', 'error');
    }
  }

  // ================= INIT =================
  async ngOnInit() {
    await this.loadCrops();
    await this.loadVideos(); // ✅ LOAD VIDEO COUNT
    await this.loadTrichodermaPrice();
  }

  // ================= LOADERS =================
  async loadCrops() {
    try {
      this.loading = true;
      this.crops = await this.cropService.getCrops();
    } catch (error) {
      console.error('❌ Error fetching crops:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadVideos() {
    try {
      const videos = await this.videoService.getVideos();
      this.videos = videos;
      this.totalVideos = videos.length; // ✅ ACTUAL COUNT
    } catch (error) {
      console.error('❌ Error fetching videos:', error);
      this.totalVideos = 0;
    }
  }

  async loadTrichodermaPrice() {
    try {
      const price = await this.cropService.getTrichodermaPrice();
      if (price !== null) {
        this.trichodermaPrice = price;
        this.newPrice = price;
      }
    } catch (error) {
      console.error('❌ Failed to fetch price:', error);
    }
  }

  // ================= HELPERS =================
  filteredCrops(): Crop[] {
    const search = this.searchText.toLowerCase();
    return this.crops.filter(
      (c) =>
        c.title_en.toLowerCase().includes(search) ||
        c.title_tl.toLowerCase().includes(search),
    );
  }

  toggleGridView(isGrid: boolean) {
    this.isGridView = isGrid;
  }

  async deleteCrop(crop: Crop) {
    if (!crop.id) return;

    try {
      await this.cropService.deleteCrop(crop.id);
      await this.loadCrops();
    } catch (error) {
      console.error('❌ Error deleting crop:', error);
    }
  }
}

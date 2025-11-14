// overview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CropService } from '../../../service/crop.service';
import { Crop } from '../../../model/crop.model';

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
  crops: Crop[] = [];
  loading = false;
  isGridView: boolean = false; // list view by default
  searchText: string = '';

  trichodermaPrice = 120.5;
  lastUpdated = new Date();
  totalVideos = 12; // example count
  totalFarmers = 57; // example count
  safeBg: SafeStyle;

  constructor(
    private sanitizer: DomSanitizer,
    private cropService: CropService
  ) {
    const imageUrl =
      'https://th.bing.com/th/id/R.4180531fe234fb34545caae63f173b64?rik=I3hswxTSO83dIQ&riu=http%3a%2f%2futkarshagro.com%2fcdn%2fshop%2farticles%2fWhatsApp-Image-2022-10-07-at-12.22.00-PM-1.jpg%3fv%3d1683696382&ehk=owb7Vs0Q4CQ8iiK5kJGLzsK44dGCB8b6H4ZMdqRhZ8E%3d&risl=&pid=ImgRaw&r=0';
    this.safeBg = this.sanitizer.bypassSecurityTrustStyle(`url('${imageUrl}')`);
  }

  toast = {
    show: false,
    message: '',
    type: '', // "loading" | "success" | "error"
  };

  showToast(
    message: string,
    type: 'loading' | 'success' | 'error' = 'success'
  ) {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;

    if (type !== 'loading') {
      setTimeout(() => this.hideToast(), 2500);
    }
  }

  hideToast() {
    this.toast.show = false;
  }
  // Modal controller
  showPriceModal = false;
  newPrice: number = 0;

  openEditPriceModal() {
    this.newPrice = this.trichodermaPrice; // preload current price
    this.showPriceModal = true;
  }

  closePriceModal() {
    this.showPriceModal = false;
  }

  // SAVE PRICE
  async updatePrice() {
    if (!this.newPrice || this.newPrice <= 0) return;

    try {
      // ❗ Replace with your own save service

      this.trichodermaPrice = this.newPrice;
      this.lastUpdated = new Date();

      this.showPriceModal = false;
      this.showToast('Price updated successfully', 'success');
    } catch (error) {
      console.error(error);
      this.showToast('Failed to update price', 'error');
    }
  }

  async ngOnInit() {
    await this.loadCrops();
  }

  async loadCrops() {
    this.loading = true;
    try {
      this.crops = await this.cropService.getCrops();
    } catch (error) {
      console.error('❌ Error fetching crops:', error);
    }
    this.loading = false;
  }

  filteredCrops(): Crop[] {
    const search = this.searchText.toLowerCase();
    return this.crops.filter(
      (c) =>
        c.title_en.toLowerCase().includes(search) ||
        c.title_tl.toLowerCase().includes(search)
    );
  }

  toggleGridView(isGrid: boolean) {
    this.isGridView = isGrid;
  }

  openAddCropModal() {
    console.log('Open add crop modal');
  }

  editCrop(crop: Crop) {
    console.log('Edit crop', crop);
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

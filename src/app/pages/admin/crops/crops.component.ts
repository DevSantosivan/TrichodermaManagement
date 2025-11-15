import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Crop } from '../../../model/crop.model';
import { CropService } from '../../../service/crop.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crops.component.html',
  styleUrls: ['./crops.component.css'],
})
export class CropsComponent implements OnInit {
  crops: Crop[] = [];
  viewMode: 'list' | 'grid' = 'list';
  searchText = '';

  isEditing = false;
  editedCrop: Crop = this.emptyCrop();
  previewImage: string | null = null;
  selectedFile: File | null = null;
  showMenuForId: string | null = null;
  loading = false;

  // TOAST STATE
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'loading',
  };

  constructor(private cropService: CropService, private route: Router) {}

  async ngOnInit() {
    await this.loadCrops();
  }

  async loadCrops() {
    this.loading = true;
    try {
      this.crops = await this.cropService.getCrops();
    } catch (error) {
      this.showToast('Error loading crops!', 'error');
      console.error('❌ Error fetching crops:', error);
    }
    this.loading = false;
  }

  // Show toast message
  showToast(message: string, type: 'success' | 'error' | 'loading') {
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

  filteredCrops() {
    const search = this.searchText.toLowerCase();
    return this.crops.filter(
      (crop) =>
        crop.title_en.toLowerCase().includes(search) ||
        crop.title_tl.toLowerCase().includes(search)
    );
  }

  toggleMenu(id: string) {
    this.showMenuForId = this.showMenuForId === id ? null : id;
  }

  openAddForm() {
    this.route.navigate(['admin/crop/add']);
  }
  openEdit(crop: any) {
    this.route.navigate(['/admin/crop/edit', crop.id]);
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedCrop = this.emptyCrop();
    this.previewImage = null;
    this.selectedFile = null;
  }

  async saveCrop() {
    try {
      this.showToast('Saving crop...', 'loading');

      if (this.editedCrop.id) {
        await this.cropService.updateCrop(
          this.editedCrop.id,
          this.editedCrop,
          this.selectedFile || undefined
        );
        this.showToast('Crop updated successfully!', 'success');
      } else {
        await this.cropService.addCrop(
          this.editedCrop,
          this.selectedFile || undefined
        );
        this.showToast('Crop added successfully!', 'success');
      }

      await this.loadCrops();
      this.cancelEdit();
    } catch (error) {
      this.showToast('Error saving crop!', 'error');
      console.error('❌ Error saving crop:', error);
    }
  }

  async deleteCrop(id: string) {
    try {
      this.showToast('Deleting crop...', 'loading');

      await this.cropService.deleteCrop(id);
      this.showToast('Crop deleted successfully!', 'success');

      await this.loadCrops();
    } catch (error) {
      this.showToast('Error deleting crop!', 'error');
      console.error('❌ Error deleting crop:', error);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private emptyCrop(): Crop {
    return {
      image_url: '',
      title_en: '',
      title_tl: '',
      description_en: '',
      description_tl: '',

      land_preparation_en: '',
      land_preparation_tl: '',
      seed_preparation_en: '',
      seed_preparation_tl: '',
      nursery_en: '',
      nursery_tl: '',
      transplanting_en: '',
      transplanting_tl: '',
      water_mgmt_en: '',
      water_mgmt_tl: '',
      harvest_en: '',
      harvest_tl: '',
    };
  }
}

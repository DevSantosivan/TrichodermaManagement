import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Crop } from '../../../model/crop.model';
import { CropService } from '../../../service/crop.service';
import {
  WaterGuideService,
  WateringGuide,
} from '../../../service/water-guide.service';

interface WateringGuideWithCrop extends WateringGuide {
  cropName?: string;
  cropImage?: string;
}

interface NewWateringGuide {
  cropId: string | null;
  description: string;
  tasks: { en: string; tl: string }[];
}

@Component({
  selector: 'app-water-guide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './water-guide.component.html',
  styleUrls: ['./water-guide.component.css'],
})
export class WaterGuideComponent implements OnInit {
  crops: Crop[] = [];
  guides: WateringGuideWithCrop[] = [];

  searchText = '';
  viewMode: 'list' | 'grid' = 'list';
  selectedGuideId: string | null | undefined = null;

  showAddModal = false;
  newGuide: NewWateringGuide = this.getEmptyGuide();
  newTaskEn = '';
  newTaskTl = '';

  showEditModal = false;
  selectedGuideToEdit: WateringGuideWithCrop | null = null;
  editTaskEn = '';
  editTaskTl = '';

  loading = false;

  addingGuide = false;
  updatingGuide = false;

  // --------------------------------------------------
  // TOAST SYSTEM
  // --------------------------------------------------
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
  // --------------------------------------------------

  constructor(
    private cropService: CropService,
    private waterGuideService: WaterGuideService
  ) {}

  ngOnInit(): void {
    this.loadCrops();
  }

  private async loadCrops() {
    this.loading = true;
    try {
      this.crops = await this.cropService.getCrops();
      await this.loadGuides();
    } catch (err) {
      console.error('Error loading crops:', err);
      this.showToast('Failed to load crops', 'error');
    } finally {
      this.loading = false;
    }
  }

  private async loadGuides() {
    this.loading = true;
    try {
      const data = await this.waterGuideService.getGuides();
      this.guides = data.map((g) => {
        const crop = this.crops.find((c) => c.id === g.crop_id);
        return {
          ...g,
          cropName: crop?.title_en ?? 'Unknown Crop',
          cropImage: crop?.image_url ?? '',
        };
      });
    } catch (err) {
      console.error('Error loading guides:', err);
      this.showToast('Failed to load guides', 'error');
    } finally {
      this.loading = false;
    }
  }

  filteredGuides() {
    if (!this.searchText) return this.guides;
    const search = this.searchText.toLowerCase();
    return this.guides.filter(
      (g) =>
        g.cropName?.toLowerCase().includes(search) ||
        g.description.toLowerCase().includes(search)
    );
  }

  // ---------------- Add Guide ----------------
  openAddModal() {
    this.showAddModal = true;
    this.newGuide = this.getEmptyGuide();
    this.newTaskEn = '';
    this.newTaskTl = '';
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  addTaskToNewGuide() {
    if (this.newTaskEn.trim() || this.newTaskTl.trim()) {
      this.newGuide.tasks.push({
        en: this.newTaskEn.trim(),
        tl: this.newTaskTl.trim(),
      });
      this.newTaskEn = '';
      this.newTaskTl = '';
    }
  }

  removeTaskFromNewGuide(index: number) {
    this.newGuide.tasks.splice(index, 1);
  }

  async saveNewGuide() {
    if (!this.newGuide.cropId || !this.newGuide.description) return;

    this.addingGuide = true;
    this.showToast('Saving guide...', 'loading');

    try {
      const savedGuide = await this.waterGuideService.addGuide({
        crop_id: this.newGuide.cropId,
        description: this.newGuide.description,
        tasks: this.newGuide.tasks.length ? this.newGuide.tasks : [],
      });

      const selectedCrop = this.crops.find((c) => c.id === savedGuide.crop_id);
      this.guides.push({
        ...savedGuide,
        cropName: selectedCrop?.title_en ?? 'Unknown Crop',
        cropImage: selectedCrop?.image_url ?? '',
      });

      this.closeAddModal();
      this.showToast('Guide added successfully!', 'success');
    } catch (err) {
      console.error('Error saving guide:', err);
      this.showToast('Failed to add guide', 'error');
    } finally {
      this.addingGuide = false;
    }
  }

  // ---------------- Edit Guide ----------------
  openEditModal(guide: WateringGuideWithCrop) {
    this.selectedGuideToEdit = { ...guide };
    this.editTaskEn = '';
    this.editTaskTl = '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedGuideToEdit = null;
  }

  addTaskToEditGuide() {
    if (!this.selectedGuideToEdit) return;
    if (this.editTaskEn.trim() || this.editTaskTl.trim()) {
      this.selectedGuideToEdit.tasks.push({
        en: this.editTaskEn.trim(),
        tl: this.editTaskTl.trim(),
      });
      this.editTaskEn = '';
      this.editTaskTl = '';
    }
  }

  removeTaskFromEditGuide(index: number) {
    this.selectedGuideToEdit?.tasks.splice(index, 1);
  }

  async saveEditedGuide() {
    if (!this.selectedGuideToEdit) return;

    this.updatingGuide = true;
    this.showToast('Updating guide...', 'loading');

    try {
      const updatedGuide = await this.waterGuideService.updateGuide(
        this.selectedGuideToEdit.id!,
        {
          crop_id: this.selectedGuideToEdit.crop_id,
          description: this.selectedGuideToEdit.description,
          tasks: this.selectedGuideToEdit.tasks.length
            ? this.selectedGuideToEdit.tasks
            : [],
        }
      );

      const index = this.guides.findIndex((g) => g.id === updatedGuide.id);
      const selectedCrop = this.crops.find(
        (c) => c.id === updatedGuide.crop_id
      );

      this.guides[index] = {
        ...updatedGuide,
        cropName: selectedCrop?.title_en ?? 'Unknown Crop',
        cropImage: selectedCrop?.image_url ?? '',
      };

      this.closeEditModal();
      this.showToast('Guide updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating guide:', err);
      this.showToast('Failed to update', 'error');
    } finally {
      this.updatingGuide = false;
    }
  }

  // ---------------- Delete Guide ----------------
  async deleteGuide(guide: WateringGuideWithCrop) {
    if (!guide.id) return;

    this.showToast('Deleting guide...', 'loading');

    try {
      await this.waterGuideService.deleteGuide(guide.id);
      this.guides = this.guides.filter((g) => g.id !== guide.id);

      this.showToast('Guide deleted!', 'success');
    } catch (err) {
      console.error('Error deleting guide:', err);
      this.showToast('Failed to delete', 'error');
    }
  }

  private getEmptyGuide(): NewWateringGuide {
    return { cropId: null, description: '', tasks: [] };
  }
}

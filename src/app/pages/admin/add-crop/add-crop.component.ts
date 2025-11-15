import { Component, ViewChild, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CropService } from '../../../service/crop.service';
import { Crop } from '../../../model/crop.model';

@Component({
  selector: 'app-add-crop',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-crop.component.html',
  styleUrls: ['./add-crop.component.css'],
})
export class AddCropComponent implements OnInit {
  @ViewChild('cropForm') cropForm!: NgForm;

  isEditMode = false;
  cropId: string | null = null;

  selectedFile: File | null = null;
  previewImage: string | null = null;

  newCrop: Crop = {
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

  toast = {
    show: false,
    message: '',
    type: 'loading' as 'loading' | 'success' | 'error',
  };

  constructor(
    private cropService: CropService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ============= INIT =============
  async ngOnInit() {
    this.cropId = this.route.snapshot.paramMap.get('id');

    if (this.cropId) {
      this.isEditMode = true;
      await this.loadCropData(this.cropId);
    }
  }

  goBack() {
    this.router.navigate(['/admin/crop']);
  }
  // ============= LOAD CROP IN EDIT MODE =============
  async loadCropData(id: string) {
    try {
      const crops = await this.cropService.getCrops();
      const crop = crops.find((c) => c.id == id);

      if (crop) {
        this.newCrop = { ...crop };
        this.previewImage = crop.image_url; // show old image
      }
    } catch (error) {
      console.error('Error loading crop:', error);
    }
  }

  // ============= IMAGE SELECT =============
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => (this.previewImage = e.target?.result as string);
    reader.readAsDataURL(file);
  }

  // ============= MARK INVALID FIELDS =============
  markAllFieldsAsTouched(form: NgForm) {
    Object.keys(form.controls).forEach((key) => {
      form.controls[key].markAsTouched();
      form.controls[key].updateValueAndValidity();
    });
  }

  async saveCrop(form: NgForm) {
    // REQUIRE IMAGE ONLY IN ADD MODE
    if (!this.isEditMode && !this.selectedFile) {
      this.showToast('Image is required.', 'error');
      setTimeout(() => this.hideToast(), 1500);
      return;
    }

    // VALIDATE REQUIRED FIELDS
    if (form.invalid) {
      this.markAllFieldsAsTouched(form);
      this.showToast('Please fill all required fields.', 'error');
      setTimeout(() => this.hideToast(), 1600);
      return;
    }

    this.showToast(
      this.isEditMode ? 'Updating crop...' : 'Saving crop...',
      'loading'
    );

    try {
      let result;

      if (this.isEditMode && this.cropId) {
        // UPDATE
        result = await this.cropService.updateCrop(
          this.cropId,
          this.newCrop,
          this.selectedFile || undefined
        );
      } else {
        // ADD
        result = await this.cropService.addCrop(
          this.newCrop,
          this.selectedFile!
        );
      }

      this.showToast(
        this.isEditMode
          ? 'Crop updated successfully!'
          : 'Crop saved successfully!',
        'success'
      );

      setTimeout(() => {
        this.hideToast();
        this.router.navigate(['/admin/crop']);
      }, 1000);
    } catch (err) {
      this.showErrorToast();
    }
  }

  // ============= CLEAR FORM AFTER SAVE =============
  clearFormFields() {
    this.newCrop = {
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

    this.selectedFile = null;
    this.previewImage = null;

    if (this.cropForm) this.cropForm.resetForm();
  }

  // ============= TOAST =============
  showToast(message: string, type: 'loading' | 'success' | 'error') {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;
  }

  hideToast() {
    this.toast.show = false;
  }

  private showErrorToast() {
    this.showToast('Error saving crop!', 'error');
    setTimeout(() => this.hideToast(), 1800);
  }
}

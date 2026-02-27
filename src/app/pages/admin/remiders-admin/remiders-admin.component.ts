import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CropReminderService } from '../../../service/reminder.service';
import { CropService } from '../../../service/crop.service';

export interface CropReminder {
  id?: string;
  crop_id: string;
  crop_name_en: string;
  crop_name_tl: string;
  description_en: string;
  description_tl: string;
  image_url: string;
  steps: {
    instructionEn: string;
    instructionTl: string;
    day: number;
  }[];
}

@Component({
  selector: 'app-remiders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './remiders-admin.component.html',
  styleUrls: ['./remiders-admin.component.css'],
})
export class RemidersAdminComponent implements OnInit {
  reminders: CropReminder[] = [];
  crops: any[] = [];

  form!: FormGroup;
  showModal = false;
  isEditing = false;
  selectedId: string | null = null;

  imagePreview: string | null = null;
  uploadFile: File | null = null;
  loading = true;
  searchText = '';

  // Toast state
  toast = {
    show: false,
    message: '',
    type: '' as 'loading' | 'success' | 'error',
  };

  constructor(
    private fb: FormBuilder,
    private reminderService: CropReminderService,
    private cropService: CropService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCrops();
    this.loadReminders();
  }

  // Type matches the ID type
  showReminderMenuForId: string | null = null;

  toggleReminderMenu(id: string | undefined) {
    if (!id) return; // safety check
    this.showReminderMenuForId = this.showReminderMenuForId === id ? null : id;
  }
  showToast(
    message: string,
    type: 'loading' | 'success' | 'error' = 'success',
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

  async loadCrops() {
    try {
      this.crops = await this.cropService.getCrops();
    } catch (err) {
      console.error('Crops load error', err);
      this.showToast('Failed to load crops.', 'error');
    }
  }

  async loadReminders() {
    this.loading = true;
    try {
      const data = await this.reminderService.getAllReminders();
      this.reminders = data;
    } catch (err) {
      console.error('Reminders load error', err);
      this.showToast('Failed to load reminders.', 'error');
    } finally {
      this.loading = false;
    }
  }

  initForm() {
    this.form = this.fb.group({
      crop_id: ['', Validators.required],
      crop_name_en: ['', Validators.required],
      crop_name_tl: ['', Validators.required],
      description_en: ['', Validators.required],
      description_tl: ['', Validators.required],
      image_url: [''],
      steps: this.fb.array([this.createStep()]),
    });
  }

  createStep(data: any = null): FormGroup {
    return this.fb.group({
      instructionEn: [data?.instructionEn || '', Validators.required],
      instructionTl: [data?.instructionTl || '', Validators.required],
      day: [data?.day || 1, [Validators.required, Validators.min(1)]],
    });
  }

  get steps(): FormArray<FormGroup> {
    return this.form.get('steps') as FormArray<FormGroup>;
  }

  addStep(data: any = null) {
    this.steps.push(this.createStep(data));
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
  }

  openCreate() {
    this.showModal = true;
    this.isEditing = false;
    this.selectedId = null;

    this.form.reset({
      crop_id: '',
      crop_name_en: '',
      crop_name_tl: '',
      description_en: '',
      description_tl: '',
      image_url: '',
    });

    this.steps.clear();
    this.addStep();
    this.imagePreview = null;
    this.uploadFile = null;
  }

  async openEdit(rem: CropReminder) {
    this.showModal = true;
    this.isEditing = true;
    this.selectedId = rem.id ?? null;

    this.form.reset({
      crop_id: rem.crop_id,
      crop_name_en: rem.crop_name_en,
      crop_name_tl: rem.crop_name_tl,
      description_en: rem.description_en,
      description_tl: rem.description_tl,
      image_url: rem.image_url,
    });

    this.steps.clear();
    rem.steps.forEach((s) => this.addStep(s));

    this.imagePreview = rem.image_url;
    this.uploadFile = null;
  }

  closeModal() {
    this.showModal = false;
    this.uploadFile = null;
  }

  onImageSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    this.uploadFile = target.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(this.uploadFile);
  }

  onCropSelected(event: Event) {
    const select = event.target as HTMLSelectElement;
    const cropId = select.value;
    const crop = this.crops.find((c) => c.id === cropId);
    if (!crop) return;

    this.form.patchValue({
      crop_id: crop.id,
      crop_name_en: crop.title_en,
      crop_name_tl: crop.title_tl,
      description_en: crop.description_en,
      description_tl: crop.description_tl,
      image_url: crop.image_url,
    });

    this.imagePreview = crop.image_url;
  }

  async save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.showToast('Fill in all required fields.', 'error');
      return;
    }

    let imageUrl = this.form.value.image_url;

    if (this.uploadFile) {
      this.showToast('Uploading image...', 'loading');
      imageUrl = await this.reminderService.uploadImage(this.uploadFile);
    }

    const payload: CropReminder = {
      crop_id: this.form.value.crop_id,
      crop_name_en: this.form.value.crop_name_en,
      crop_name_tl: this.form.value.crop_name_tl,
      description_en: this.form.value.description_en,
      description_tl: this.form.value.description_tl,
      image_url: imageUrl,
      steps: this.form.value.steps,
    };

    try {
      if (this.isEditing && this.selectedId) {
        await this.reminderService.updateReminder(this.selectedId, payload);
        this.showToast('Reminder updated successfully!', 'success');
      } else {
        await this.reminderService.createReminder(payload);
        this.showToast('Reminder created successfully!', 'success');
      }
      this.closeModal();
      await this.loadReminders();
    } catch (err) {
      console.error('Failed to save reminder', err);
      this.showToast('Failed to save reminder.', 'error');
    }
  }

  async delete(rem: CropReminder) {
    if (!confirm(`Delete reminder for ${rem.crop_name_en}?`)) return;

    try {
      await this.reminderService.deleteReminder(rem.id!);
      await this.loadReminders();
      this.showToast('Reminder deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete failed', err);
      this.showToast('Failed to delete reminder.', 'error');
    }
  }

  filteredReminders(): CropReminder[] {
    if (!this.searchText.trim()) return this.reminders;
    const s = this.searchText.toLowerCase();

    return this.reminders.filter(
      (r) =>
        r.crop_name_en.toLowerCase().includes(s) ||
        r.crop_name_tl.toLowerCase().includes(s),
    );
  }
}

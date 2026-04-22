import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CropService } from '../../../service/crop.service';
import { Crop } from '../../../model/crop.model';
import { Video } from '../../../model/video.model';
import { VideoService } from '../../../service/video-tutorial.service';

@Component({
  selector: 'app-video-tutorial',
  templateUrl: './video-tutorial.component.html',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  styleUrls: ['./video-tutorial.component.css'],
})
export class VideoTutorialComponent implements OnInit {
  viewMode: 'list' | 'grid' = 'list';
  searchText: string = '';
  selectedVideo: Video | null = null;
  showMenuForId: string | null = null;

  videos: Video[] = [];
  isEditing = false;
  editedVideo: Partial<Video> = {};
  selectedFile: File | null = null;
  loading: boolean = false;
  crops: Crop[] = [];

  // 🟦 TOAST STATE
  toast = {
    show: false,
    message: '',
    type: 'loading' as 'loading' | 'success' | 'error',
  };

  constructor(
    private cropService: CropService,
    private videoService: VideoService,
  ) {}

  async ngOnInit() {
    await this.loadCrops();
    await this.loadVideos();
  }

  // 🟦 TOAST FUNCTIONS
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

  // Load crops
  async loadCrops() {
    try {
      this.crops = await this.cropService.getCrops();
    } catch (error) {
      console.error('Failed to load crops', error);
    }
  }

  // Load videos
  async loadVideos() {
    try {
      this.loading = true;
      this.videos = await this.videoService.getVideos();
    } catch (error) {
      console.error('Failed to load videos', error);
    } finally {
      this.loading = false;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  filteredVideos(): Video[] {
    const text = this.searchText?.trim().toLowerCase() || '';

    if (!text) return this.videos;

    return this.videos.filter((v) => {
      const title = v.title_en?.toLowerCase() || '';
      const crop = v.croptype?.toLowerCase() || '';

      return title.includes(text) || crop.includes(text);
    });
  }

  playVideo(video: Video) {
    this.selectedVideo = video;
  }

  toggleMenu(videoId: string) {
    this.showMenuForId = this.showMenuForId === videoId ? null : videoId;
  }

  openAddForm() {
    this.isEditing = true;
    this.editedVideo = {};
    this.selectedFile = null;
  }

  openEdit(video: Video) {
    this.isEditing = true;
    this.editedVideo = { ...video };
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedVideo = {};
    this.selectedFile = null;
  }

  // 🟦 SAVE VIDEO (with toast)
  async saveVideo() {
    if (
      !this.editedVideo.title_en ||
      !this.editedVideo.title_tl ||
      !this.editedVideo.croptype
    )
      return;

    this.showToast('Saving video...', 'loading');

    try {
      this.loading = true;
      let fileUrl = this.editedVideo.url || '';

      if (this.selectedFile) {
        fileUrl = await this.videoService.uploadVideo(this.selectedFile);
      }

      const videoData: Video = {
        id: this.editedVideo.id,
        title_en: this.editedVideo.title_en!,
        title_tl: this.editedVideo.title_tl!,
        description: this.editedVideo.description,
        croptype: this.editedVideo.croptype!,
        url: fileUrl,
      };

      await this.videoService.saveVideoMetadata(videoData);
      await this.loadVideos();

      this.cancelEdit();
      this.showToast('Video saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save video', error);
      this.showToast('Failed to save video', 'error');
    } finally {
      this.loading = false;
    }
  }

  // 🟦 DELETE VIDEO (with toast)
  async deleteVideo(id?: string) {
    if (!id) return;

    this.showToast('Deleting...', 'loading');

    try {
      await this.videoService.deleteVideo(id);
      this.videos = this.videos.filter((v) => v.id !== id);

      this.showToast('Video deleted', 'success');
    } catch (error) {
      console.error('Failed to delete video', error);
      this.showToast('Failed to delete video', 'error');
    }
  }
}

// src/app/service/video-tutorial.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environmennt/environment.prod';
import { Video } from '../model/video.model';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private supabase: SupabaseClient;
  private bucketName = 'videos';

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
    );
  }

  /**
   * 📤 Upload a video file to Supabase Storage
   */
  async uploadVideo(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error || !data?.path) {
      console.error('❌ Video upload failed', error);
      throw error || new Error('Upload failed: no path returned');
    }

    // ✅ Get public URL of uploaded video
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('❌ Failed to get public URL for uploaded video');
    }

    return urlData.publicUrl;
  }

  /**
   * 📝 Insert or Update video metadata in Supabase table `videos`
   */
  async saveVideoMetadata(video: Video): Promise<Video> {
    const { id, ...data } = video;

    const payload = {
      title_en: data.title_en,
      title_tl: data.title_tl,
      description: data.description,
      croptype: data.croptype,
      url: data.url,
    };

    if (id) {
      // ✅ UPDATE
      const { data: updated, error } = await this.supabase
        .from('videos')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update video', error);
        throw error;
      }

      return updated as Video;
    } else {
      // ✅ INSERT
      const { data: inserted, error } = await this.supabase
        .from('videos')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to insert video', error);
        throw error;
      }

      return inserted as Video;
    }
  }

  /**
   * 📥 Get all videos (sorted by insertion date)
   */
  async getVideos(): Promise<Video[]> {
    const { data, error } = await this.supabase
      .from('videos')
      .select('*')
      .order('inserted_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch videos', error);
      throw error;
    }
    return data as Video[];
  }

  /**
   * 🗑 Delete video metadata by ID
   */
  async deleteVideo(id: string): Promise<void> {
    const { error } = await this.supabase.from('videos').delete().eq('id', id);
    if (error) {
      console.error('❌ Failed to delete video', error);
      throw error;
    }
  }
}

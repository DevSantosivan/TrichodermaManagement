import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environmennt/environment.prod';
import { Crop } from '../model/crop.model';

@Injectable({
  providedIn: 'root',
})
export class CropService {
  private supabase: SupabaseClient;
  private bucketName = 'crop-images'; // Make sure this bucket exists in Supabase

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // ✅ GET all crops
  async getCrops(): Promise<Crop[]> {
    const { data, error } = await this.supabase
      .from('crops')
      .select('*')
      .order('id');
    if (error) throw error;
    return data as Crop[];
  }

  // ✅ UPLOAD image to Supabase Storage
  // ✅ UPLOAD image to Supabase Storage
  async uploadImage(file: File, path?: string): Promise<string> {
    const filePath = path || `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;
    return publicUrl;
  }

  // ✅ ADD new crop with optional image
  async addCrop(crop: Omit<Crop, 'id'>, imageFile?: File): Promise<Crop> {
    if (imageFile) {
      crop.image_url = await this.uploadImage(imageFile); // store URL instead of Base64
    }
    const { data, error } = await this.supabase
      .from('crops')
      .insert([crop])
      .select()
      .single();
    if (error) throw error;
    return data as Crop;
  }

  // ✅ UPDATE crop with optional new image
  async updateCrop(
    id: string,
    crop: Partial<Crop>,
    imageFile?: File
  ): Promise<Crop> {
    if (imageFile) {
      crop.image_url = await this.uploadImage(imageFile);
    }
    const { data, error } = await this.supabase
      .from('crops')
      .update(crop)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Crop;
  }

  // ✅ DELETE crop
  async deleteCrop(id: string): Promise<void> {
    const { error } = await this.supabase.from('crops').delete().eq('id', id);
    if (error) throw error;
  }
}

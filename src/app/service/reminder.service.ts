import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environmennt/environment.prod';
import { CropReminder } from '../model/crop-reminder.model';

@Injectable({
  providedIn: 'root',
})
export class CropReminderService {
  private supabase: SupabaseClient;
  private table = 'crop_reminders';
  private bucket = 'reminder-images';

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Upload image to Supabase Storage
  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `reminders/${fileName}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file);
    if (error) throw error;

    const { data: publicUrl } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);
    return publicUrl.publicUrl;
  }

  // CREATE
  async createReminder(reminder: CropReminder) {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        crop_id: reminder.crop_id, // Must exist in DB
        crop_name_en: reminder.crop_name_en,
        crop_name_tl: reminder.crop_name_tl,
        description_en: reminder.description_en || null, // optional
        description_tl: reminder.description_tl || null, // optional
        image_url: reminder.image_url || null,
        steps: reminder.steps || [],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // READ ALL
  async getAllReminders(): Promise<CropReminder[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CropReminder[];
  }

  // READ ONE
  async getReminderById(id: string): Promise<CropReminder> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as CropReminder;
  }

  // UPDATE
  async updateReminder(id: string, reminder: Partial<CropReminder>) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        crop_id: reminder.crop_id, // Must exist in DB
        crop_name_en: reminder.crop_name_en,
        crop_name_tl: reminder.crop_name_tl,
        description_en: reminder.description_en || null, // optional
        description_tl: reminder.description_tl || null, // optional
        image_url: reminder.image_url || null,
        steps: reminder.steps || [],
        created_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // DELETE
  async deleteReminder(id: string) {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

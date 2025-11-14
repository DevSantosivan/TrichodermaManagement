import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environmennt/environment.prod';

export interface WateringGuide {
  id?: string;
  crop_id: string;
  description: string;
  tasks: { en: string; tl: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class WaterGuideService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async getGuides(): Promise<WateringGuide[]> {
    const { data, error } = await this.supabase
      .from('watering_guides')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching guides:', error);
      throw error;
    }

    return (data as any[]).map((g) => ({
      ...g,
      tasks: g.tasks || [],
    }));
  }

  async addGuide(guide: Omit<WateringGuide, 'id'>): Promise<WateringGuide> {
    console.log('Inserting guide:', guide);
    const { data, error } = await this.supabase
      .from('watering_guides')
      .insert([guide])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    return data as WateringGuide;
  }

  async updateGuide(
    id: string,
    guide: Partial<WateringGuide>
  ): Promise<WateringGuide> {
    console.log('Updating guide:', id, guide);
    const { data, error } = await this.supabase
      .from('watering_guides')
      .update(guide)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    return data as WateringGuide;
  }

  async deleteGuide(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('watering_guides')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
  }
}

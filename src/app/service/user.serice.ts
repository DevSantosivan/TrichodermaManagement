import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environmennt/environment.prod';

export interface User {
  id: string;
  name: string;
  email: string;
  status?: 'active' | 'blocked';
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
    );
  }
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error.message);
      return null;
    }

    return data || null;
  }
  // ✅ REGISTER
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(error.message);
      return false;
    }

    if (data.user) {
      const { error: insertError } = await this.supabase.from('users').insert([
        {
          id: data.user.id,
          name,
          email,
          status: 'active',
        },
      ]);

      if (insertError) {
        console.error(insertError.message);
        return false;
      }

      return true;
    }

    return false;
  }

  // ✅ GET USERS
  async getUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error.message);
      return [];
    }

    return data || [];
  }

  // ✅ UPDATE
  async updateUser(user: User): Promise<boolean> {
    const { error } = await this.supabase
      .from('users')
      .update({
        name: user.name,
        email: user.email,
      })
      .eq('id', user.id);

    return !error;
  }

  // ✅ DELETE
  async deleteUser(id: string): Promise<boolean> {
    const { error } = await this.supabase.from('users').delete().eq('id', id);

    return !error;
  }

  // ✅ BLOCK / UNBLOCK
  async toggleBlock(user: User): Promise<boolean> {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';

    const { error } = await this.supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', user.id);

    return !error;
  }
}

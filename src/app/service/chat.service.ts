import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environmennt/environment.prod';
import { BehaviorSubject } from 'rxjs';

// Type for each chat user (for admin chat list)
export interface ChatUser {
  id: string;
  name: string;
  email: string;
  lastMessage: string;
  unreadCount: number;
  time: Date;
}

// Type for messages between admin and user
export interface Message {
  id?: string;
  content: string;
  sender: 'admin' | 'user';
  time: Date;
}

// Supabase table row types
interface ChatRow {
  user_id: string;
  last_message: string;
  updated_at: string;
  unread_count: number;
  user: { name: string; email: string };
}

interface MessageRow {
  id?: string;
  user_id: string;
  content: string;
  sender: 'admin' | 'user';
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private supabase: SupabaseClient;

  // Reactive state
  public chatUsers$ = new BehaviorSubject<ChatUser[]>([]);
  public messages$ = new BehaviorSubject<Message[]>([]);
  messageChannel: any;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
    );
  }

  /** Fetch all users who chatted with admin */
  async fetchChatUsers() {
    const { data, error } = await this.supabase
      .from('chats')
      .select(
        'user_id, last_message, updated_at, unread_count, users(name,email)',
      )
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return;
    }

    const users: ChatUser[] = (data || []).map((d: any) => ({
      id: d.user_id,
      name: d.users.name,
      email: d.users.email,
      lastMessage: d.last_message,
      unreadCount: d.unread_count,
      time: new Date(d.updated_at),
    }));

    this.chatUsers$.next(users);
  }

  /** Fetch messages for a specific user */
  async fetchMessages(userId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId) // ← use user_id instead of chat_id
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const msgs: Message[] = (data || []).map((m: any) => ({
      id: m.id,
      content: m.content,
      sender: m.sender,
      time: new Date(m.created_at),
    }));

    this.messages$.next(msgs);
  }
  /** Send a new message as admin */
  async sendMessage(userId: string, content: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert([
        {
          user_id: userId, // IMPORTANT
          sender: 'admin',
          content: content,
        },
      ])
      .select();

    if (error) throw error;

    const current = this.messages$.value;

    this.messages$.next([
      ...current,
      {
        id: data?.[0]?.id,
        content,
        sender: 'admin',
        time: new Date(),
      },
    ]);
  }

  /** Realtime subscription to new messages from a specific user */
  subscribeToMessages(userId: string, p0: (newMsg: any) => void) {
    // Remove previous channel if exists
    if (this.messageChannel) {
      this.supabase.removeChannel(this.messageChannel);
    }

    this.messageChannel = this.supabase
      .channel(`messages-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newMsg: Message = {
            id: payload.new['id'],
            content: payload.new['content'], // <-- use ['content'] here
            sender: payload.new['sender'],
            time: new Date(payload.new['created_at']),
          };

          // Update messages$
          const current = this.messages$.value;
          this.messages$.next([...current, newMsg]);

          // Update chatUsers$
          const currentChats = this.chatUsers$.value;
          const chatIndex = currentChats.findIndex((c) => c.id === userId);
          if (chatIndex >= 0) {
            currentChats[chatIndex].lastMessage = newMsg.content;
            currentChats[chatIndex].time = newMsg.time;
            if (newMsg.sender === 'user') {
              currentChats[chatIndex].unreadCount += 1;
            }
            this.chatUsers$.next([...currentChats]);
          }
        },
      )
      .subscribe();
  }

  unsubscribeMessages() {
    if (this.messageChannel) {
      this.supabase.removeChannel(this.messageChannel);
    }
  }
}

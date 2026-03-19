import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ChatUser } from '../../../service/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true, // make it standalone
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  chats: ChatUser[] = [];
  loading = true;
  searchText = '';

  private sub: Subscription = new Subscription(); // initialize to avoid undefined

  constructor(
    private router: Router,
    private chatService: ChatService,
  ) {}

  ngOnInit() {
    // fetch chat users
    this.chatService
      .fetchChatUsers()
      .catch((err) => console.error('Error fetching chats:', err))
      .finally(() => (this.loading = false));

    // subscribe to reactive chat list
    this.sub = this.chatService.chatUsers$.subscribe((users) => {
      this.chats = users;
    });
  }

  // getter for filtered chats
  get filteredChats(): ChatUser[] {
    if (!this.searchText) return this.chats;
    return this.chats.filter((chat) =>
      chat.name.toLowerCase().includes(this.searchText.toLowerCase()),
    );
  }

  openChat(chat: ChatUser) {
    this.router.navigate(['/admin/chat', chat.id]);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}

import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, Message } from '../../../service/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-box',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
})
export class ChatBoxComponent implements OnInit, AfterViewInit, OnDestroy {
  userId!: string;
  user: any;
  messages: Message[] = [];
  newMessage = '';

  private msgSub!: Subscription;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId')!;
    this.loadUserAndMessages();
  }

  ngAfterViewInit() {
    // Ensure scrolling happens after view is ready
    setTimeout(() => this.scrollToBottom(), 100);
  }

  async loadUserAndMessages() {
    // 1️⃣ Find the user in chatUsers$
    const chats = this.chatService.chatUsers$.value;
    this.user = chats.find((c) => c.id === this.userId);

    // 2️⃣ If not loaded yet, fetch chats from Supabase
    if (!this.user) {
      await this.chatService.fetchChatUsers();
      const updatedChats = this.chatService.chatUsers$.value;
      this.user = updatedChats.find((c) => c.id === this.userId);
    }

    // 3️⃣ Fetch messages for this user
    await this.chatService.fetchMessages(this.userId);

    // 4️⃣ Subscribe to live updates
    this.msgSub = this.chatService.messages$.subscribe((msgs) => {
      this.messages = msgs;
      setTimeout(() => this.scrollToBottom(), 50);
    });

    // 5️⃣ Subscribe to realtime messages
    this.chatService.subscribeToMessages(this.userId, (newMsg) => {
      console.log('New message received realtime:', newMsg);
    });
  }
  async sendMessage() {
    if (!this.newMessage.trim()) return;
    await this.chatService.sendMessage(this.userId, this.newMessage);
    this.newMessage = '';
  }

  scrollToBottom() {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    el.scrollTop = el.scrollHeight;
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.msgSub?.unsubscribe();
  }
}

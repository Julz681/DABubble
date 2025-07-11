import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ThreadPanelService } from '../services/thread.panel.service';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

interface ChatMessage {
  id: number;
  userId: string;
  author: string;
  time: string;
  content: string;
  avatar: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
  isSelf?: boolean;
  replies?: ChatMessage[];
  replyToId?: number;
  createdAt: Date;
}

@Component({
  selector: 'app-thread-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './thread-panel.component.html',
  styleUrls: ['./thread-panel.component.scss'],
})
export class ThreadPanelComponent implements OnInit, OnDestroy {
  @Output() closePanel = new EventEmitter<void>();
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;

  currentUserId = 'frederik';
  newMessage = '';
  showEmojis = false;
  showUsers = false;
  replyToUser: string | null = null;
  hoveredMessageId: number | null = null;
  editingMessageId: number | null = null;
  editedMessageContent: string = '';

  rootMessage: ChatMessage | null = null;
  replies: ChatMessage[] = [];

  private subscriptions: Subscription[] = [];

  emojis: string[] = [
    '😀',
    '😂',
    '😅',
    '😍',
    '😎',
    '😢',
    '👍',
    '👎',
    '❤️',
    '🔥',
    '🎯',
    '👏',
  ];

  allUsers: ChatUser[] = [
    {
      id: 'frederik',
      name: 'Frederik Beck (Du)',
      avatar: 'assets/Frederik Beck.png',
    },
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
  ];

  constructor(private threadService: ThreadPanelService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.threadService.threadRootMessage$.subscribe((msg) => {
        this.rootMessage = msg;
      })
    );

    this.subscriptions.push(
      this.threadService.threadReplies$.subscribe(
        (replies) => (this.replies = replies)
      )
    );

    this.subscriptions.push(
      this.threadService.initialReplyText$.subscribe((text) => {
        this.setInitialReplyText(text);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  toggleEmojiPicker(): void {
    this.showEmojis = !this.showEmojis;
    if (this.showEmojis) {
      this.showUsers = false;
    }
  }

  toggleUserList(): void {
    this.showUsers = !this.showUsers;
    this.showEmojis = false;
  }

  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojis = false;
  }

  mentionUser(user: { name: string }): void {
    this.newMessage += `@${user.name} `;
    this.showUsers = false;
  }

  replyTo(user: string): void {
    const mention = `@${user} `;

    if (!this.newMessage.startsWith(mention)) {
      this.newMessage = mention;
    }

    this.replyToUser = user;

    setTimeout(() => {
      const input = this.messageInput?.nativeElement;
      if (input) {
        input.focus();
        const pos = this.newMessage.length;
        input.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed || !this.rootMessage) return;

    const now = new Date();
    const newReply: ChatMessage = {
      id: Date.now(),
      userId: this.currentUserId,
      author: 'Frederik Beck (Du)',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: trimmed,
      avatar: 'assets/Frederik Beck.png',
      createdAt: now,
      reactions: [],
      isSelf: true,
    };

    this.threadService.addReply(newReply);
    this.newMessage = '';
    this.replyToUser = null;
    this.showEmojis = false;
    this.showUsers = false;

    setTimeout(() => this.messageInput?.nativeElement?.focus());
  }

  toggleReaction(message: ChatMessage, emoji: string): void {
    if (!message.reactions) message.reactions = [];

    const existing = message.reactions.find((r) => r.emoji === emoji);

    if (existing) {
      const index = existing.users.indexOf(this.currentUserId);

      if (index > -1) {
        existing.users.splice(index, 1);
        existing.count--;

        if (existing.count === 0) {
          message.reactions = message.reactions.filter((r) => r !== existing);
        }
      } else {
        existing.users.push(this.currentUserId);
        existing.count++;
      }
    } else {
      message.reactions.push({
        emoji,
        count: 1,
        users: [this.currentUserId],
      });
    }
  }

  getUserNameFromId(id: string): string {
    return this.allUsers.find((u) => u.id === id)?.name || id;
  }

  getUserNamesFromIds(ids: string[]): string[] {
    return ids.map((id) => this.getUserNameFromId(id));
  }

  getLastReplyTime(): string {
    if (!this.replies.length) return '';
    return this.replies[this.replies.length - 1].time;
  }

  closeThreadPanel(): void {
    this.threadService.close();
    this.closePanel.emit();
  }

  setInitialReplyText(text: string): void {
    this.newMessage = text;
    setTimeout(() => {
      const input = this.messageInput?.nativeElement;
      if (input) {
        input.focus();
        const pos = this.newMessage.length;
        input.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  startEditing(msg: ChatMessage): void {
    this.editingMessageId = msg.id;
    this.editedMessageContent = msg.content;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editedMessageContent = '';
  }

  saveEdit(msg: ChatMessage): void {
    const trimmed = this.editedMessageContent.trim();
    if (!trimmed) return;

    msg.content = trimmed;
    this.editingMessageId = null;
    this.editedMessageContent = '';
  }
}

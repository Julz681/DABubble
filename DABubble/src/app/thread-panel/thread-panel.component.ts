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
import { MatDialog } from '@angular/material/dialog';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import {
  CurrentUserService,
  CurrentUser,
} from '../services/current.user.service';

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
  edited?: boolean;
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

  currentUser: CurrentUser;
  currentUserId = '';
  newMessage = '';
  showEmojis = false;
  showUsers = false;
  replyToUser: string | null = null;
  hoveredMessageId: number | null = null;
  editingMessageId: number | null = null;
  editedMessageContent = '';

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

  constructor(
    private threadService: ThreadPanelService,
    private dialog: MatDialog,
    private currentUserService: CurrentUserService
  ) {
    this.currentUser = this.currentUserService.getCurrentUser();
    this.currentUserId = this.currentUser.id;
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.threadService.threadRootMessage$.subscribe(
        (msg) => (this.rootMessage = msg)
      )
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
    if (this.showEmojis) this.showUsers = false;
  }

  toggleUserList(): void {
    this.showUsers = !this.showUsers;
    this.showEmojis = false;
  }

  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojis = false;
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
      userId: this.currentUser.id,
      author: `${this.currentUser.name} (Du)`,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: trimmed,
      avatar: this.currentUser.avatar,
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
      const idx = existing.users.indexOf(this.currentUserId);
      if (idx !== -1) {
        existing.users.splice(idx, 1);
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
    if (id === this.currentUser?.id) {
      return `${this.currentUser.name} (Du)`;
    }

    const fallback: { [key: string]: string } = {
      sofia: 'Sofia Müller',
      noah: 'Noah Braun',
      frederik: 'Frederik Beck',
    };

    return fallback[id] ?? id;
  }

  getUserNamesFromIds(ids: string[]): string[] {
    return ids.map((id) => this.getUserNameFromId(id));
  }

  getLastReplyTime(): string {
    return this.replies.length
      ? this.replies[this.replies.length - 1].time
      : '';
  }

  closeThreadPanel(): void {
    this.threadService.close();
    this.closePanel.emit();
  }

  setInitialReplyText(text: string): void {
    this.newMessage = text;
  }

  startEditing(msg: ChatMessage): void {
    this.editingMessageId = msg.id;
    this.editedMessageContent = msg.content;
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editedMessageContent = '';
  }

  saveEdit(message: ChatMessage): void {
    const trimmed = this.editedMessageContent.trim();
    if (trimmed) {
      message.content = trimmed;
      message.edited = true;
    }
    this.cancelEdit();
  }

  openUserProfile(msg: ChatMessage): void {
    if (msg.userId === this.currentUserId) return;

    const dialogRef = this.dialog.open(UserProfileComponent, {
      width: '400px',
      data: {
        id: msg.userId,
        name: this.getUserNameFromId(msg.userId),
        avatar: msg.avatar,
        email: `${msg.userId}@beispiel.com`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.startChatWith) {
        window.dispatchEvent(
          new CustomEvent('startDirectChat', { detail: result.startChatWith })
        );
      }
    });
  }
}

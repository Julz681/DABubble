import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  HostListener,
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
import { ChannelService } from '../services/channel.service';
import { FileService } from '../services/file.service';




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
  @ViewChild('mentionMenuRef') mentionMenuRef!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  currentUser!: CurrentUser;
  newMessage = '';
  showEmojis = false;
  showUsers = false;
  replyToUser: string | null = null;
  hoveredMessageId: number | null = null;
  editingMessageId: number | null = null;
  editedMessageContent = '';
  emojiPopoverMessage: ChatMessage | null = null;
  selectedFileName: string | null = null;


  mentionMode: 'user' | null = null;
  allUsers: any[] = [];
  filteredUsers: any[] = [];

  rootMessage: ChatMessage | null = null;
  replies: ChatMessage[] = [];

  private subscriptions: Subscription[] = [];

  emojis: string[] = [
    '😀', '😂', '😅', '😍', '😎', '😢', '👍', '👎', '❤️', '🔥', '🎯', '👏',
  ];

  constructor(
    private threadService: ThreadPanelService,
    private dialog: MatDialog,
    private currentUserService: CurrentUserService,
    private channelService: ChannelService,
    private fileService: FileService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.currentUserService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        this.updateOwnAvatars(user.avatar);
        this.loadUsers(); // ⬅ Nutzerliste initial laden
      })
    );

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
loadUsers(): void {
  const currentChannel = this.channelService.getCurrentChannel();
  if (!currentChannel) {
    this.allUsers = [];
    return;
  }

  this.allUsers = this.channelService.getMembersForChannel(currentChannel.name);
}



  toggleEmojiPicker(): void {
    this.showEmojis = !this.showEmojis;
    if (this.showEmojis) this.showUsers = false;
  }

  toggleUserList(): void {
    this.showUsers = !this.showUsers;
    this.showEmojis = false;

    if (this.showUsers) {
      this.mentionMode = 'user';
      this.filteredUsers = [...this.allUsers];
    } else {
      this.mentionMode = null;
    }
  }

@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  // === MENTION ===
  const clickedInsideMention =
    this.mentionMenuRef?.nativeElement.contains(target);
  const clickedMentionButton =
    target.closest('button')?.innerText === '@' || target.closest('.mention-toggle-btn');

  if (!clickedInsideMention && !clickedMentionButton && this.showUsers) {
    this.showUsers = false;
    this.mentionMode = null;
  }

  // === EMOJI POPOVER ===
  const isInPopover = !!target.closest('.emoji-picker.popover');
  const isEmojiPlus = !!target.closest('.emoji-plus');

  if (!isInPopover && !isEmojiPlus) {
    this.emojiPopoverMessage = null;
  }
}



onMessageInput(): void {
  const atIndex = this.newMessage.lastIndexOf('@');
  if (atIndex !== -1 && (atIndex === 0 || this.newMessage.charAt(atIndex - 1) === ' ')) {
    const query = this.newMessage.substring(atIndex + 1).toLowerCase();
    this.filteredUsers = this.allUsers.filter((user) =>
      user.name.toLowerCase().startsWith(query)
    );
    this.showUsers = this.filteredUsers.length > 0;
    this.mentionMode = this.showUsers ? 'user' : null;
  } else {
    this.showUsers = false;
    this.mentionMode = null;
  }
}


  mentionUser(user: any): void {
    const atIndex = this.newMessage.lastIndexOf('@');
    if (atIndex !== -1) {
      this.newMessage =
        this.newMessage.slice(0, atIndex) + `@${user.name} `;
    } else {
      this.newMessage += `@${user.name} `;
    }

    this.showUsers = false;
    this.mentionMode = null;

    setTimeout(() => {
      const input = this.messageInput?.nativeElement;
      if (input) {
        input.focus();
        const pos = this.newMessage.length;
        input.setSelectionRange(pos, pos);
      }
    }, 0);
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
    const userId = this.currentUser.id;

    if (existing) {
      const idx = existing.users.indexOf(userId);
      if (idx !== -1) {
        existing.users.splice(idx, 1);
        existing.count--;
        if (existing.count === 0) {
          message.reactions = message.reactions.filter((r) => r !== existing);
        }
      } else {
        existing.users.push(userId);
        existing.count++;
      }
    } else {
      message.reactions.push({
        emoji,
        count: 1,
        users: [userId],
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
    if (msg.userId === this.currentUser.id) return;

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

  toggleEmojiPopover(message: ChatMessage): void {
    this.emojiPopoverMessage =
      this.emojiPopoverMessage === message ? null : message;
  }

  addReaction(message: ChatMessage, emoji: string): void {
    this.toggleReaction(message, emoji);
    this.emojiPopoverMessage = null;
  }

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.selectedFileName = file.name; // Vorschau anzeigen

    const now = new Date();
    const path = `uploads/${Date.now()}_${file.name}`;
    const { url$ } = this.fileService.uploadFile(file, path);

    url$.subscribe({
      next: (downloadUrl: string) => {
        const newReply: ChatMessage = {
          id: Date.now(),
          userId: this.currentUser.id,
          author: `${this.currentUser.name} (Du)`,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `[Datei: ${file.name}](${downloadUrl})`,
          avatar: this.currentUser.avatar,
          createdAt: now,
          reactions: [],
          isSelf: true,
        };

        this.threadService.addReply(newReply);

        // Reset
        this.selectedFileName = null;
        this.fileInput.nativeElement.value = ''; // wichtig für gleiche Datei nochmal
      },
      error: (err) => {
        console.error('Upload fehlgeschlagen:', err);
      }
    });
  }
}



isMarkdownLink(text: string): boolean {
  return /\[.*?\]\((https?:\/\/.*?)\)/.test(text);
}

extractUrl(text: string): string {
  const match = text.match(/\((https?:\/\/.*?)\)/);
  return match ? match[1] : '';
}

extractFileName(text: string): string {
  const match = text.match(/\[Datei:\s*(.*?)\]/);
  return match ? `Datei: ${match[1]}` : 'Datei öffnen';
}


get currentUserId(): string {
  return this.currentUser?.id;
}

  private updateOwnAvatars(newAvatar: string): void {
  // Root Message prüfen
  if (this.rootMessage && this.rootMessage.userId === this.currentUser?.id) {
    this.rootMessage.avatar = newAvatar;
  }

  // Alle eigenen Antworten im Thread aktualisieren
  this.replies = this.replies.map(reply =>
    reply.userId === this.currentUser?.id
      ? { ...reply, avatar: newAvatar }
      : reply
  );
}

}

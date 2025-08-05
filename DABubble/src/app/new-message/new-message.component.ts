import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { filter, take } from 'rxjs/operators';
import { Channel } from '../services/channel.service';

import {
  CurrentUserService,
  CurrentUser,
} from '../services/current.user.service';
import { ChannelService } from '../services/channel.service';
import { FileService } from '../services/file.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Recipient {
  id: string;
  name: string;
  avatar: string;
  label: string;
  type: 'user' | 'channel';
}

@Component({
  selector: 'app-new-message',
  standalone: true,
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class NewMessageComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('textArea') textAreaRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  recipientInput = new FormControl('');
  message = '';
  selectedRecipients: Recipient[] = [];
  selectedFiles: File[] = [];

  allUsers: CurrentUser[] = [];
  allChannels: string[] = [];

  filteredRecipients: Recipient[] = [];
  mentionSuggestions: Recipient[] = [];

  showRecipientSuggestions = false;
  showMentionSuggestions = false;
  showEmojis = false;

  emojis = ['😀', '😄', '🚀', '❤️', '👍', '✅', '🎯', '😂'];

  constructor(
    private currentUserService: CurrentUserService,
    private channelService: ChannelService,
    private fileService: FileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.allUsers = this.currentUserService.getAllUsers();
    this.allChannels = this.channelService.getChannels().map((c) => c.name);

    this.recipientInput.valueChanges
      .pipe(debounceTime(200))
      .subscribe((value) => {
        this.updateRecipientSuggestions(value ?? '');
      });
  }

  selectRecipient(user: Recipient) {
    const exists = this.selectedRecipients.some((r) => r.id === user.id);
    if (!exists) {
      this.selectedRecipients.push(user);
    }
    this.recipientInput.setValue('');
    this.showRecipientSuggestions = false;
  }

  removeRecipient(recipient: Recipient) {
    this.selectedRecipients = this.selectedRecipients.filter(
      (r) => r.id !== recipient.id
    );
  }

  onMessageInput(): void {
    const textarea = this.textAreaRef.nativeElement;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = this.message.slice(0, cursorPos);
    const match = textBeforeCursor.match(/(^|\s)@(\w*)$/);

    if (match) {
      const query = match[2].toLowerCase();

      const userSuggestions: Recipient[] = this.allUsers
        .filter((user) => user.name.toLowerCase().includes(query))
        .map((user) => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          label: `@${user.name}`,
          type: 'user',
        }));

      const channelSuggestions: Recipient[] = this.channelService
        .getChannels()
        .filter((ch) => ch.name.toLowerCase().includes(query))
        .map((ch) => ({
          id: ch.name,
          name: ch.name,
          avatar: '',
          label: `#${ch.name}`,
          type: 'channel',
        }));

      this.mentionSuggestions = [...userSuggestions, ...channelSuggestions];
      this.showMentionSuggestions = this.mentionSuggestions.length > 0;
    } else {
      this.showMentionSuggestions = false;
    }
  }

  insertMention(user: Recipient) {
    const textarea = this.textAreaRef.nativeElement;
    const cursor = textarea.selectionStart;

    const before = this.message
      .slice(0, cursor)
      .replace(/@(\w*)$/, `@${user.name}`);
    const after = this.message.slice(cursor);
    this.message = before + after;

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = before.length;
    });

    this.showMentionSuggestions = false;
  }

  toggleEmoji() {
    this.showEmojis = !this.showEmojis;
    this.showMentionSuggestions = false;
  }

  addEmoji(emoji: string) {
    this.message += emoji;
    this.showEmojis = false;
    this.textAreaRef.nativeElement.focus();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles.push(...Array.from(input.files));
    }
  }

  toggleMentionPicker(): void {
    const textarea = this.textAreaRef.nativeElement;
    const cursor = textarea.selectionStart;
    const before = this.message.slice(0, cursor);
    const after = this.message.slice(cursor);

    this.message = before + '@' + after;

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = before.length + 1;

      this.mentionSuggestions = [
        ...this.allUsers.map((user) => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          label: `@${user.name}`,
          type: 'user' as const,
        })),
        ...this.channelService.getChannels().map((ch) => ({
          id: ch.name,
          name: ch.name,
          avatar: '',
          label: `#${ch.name}`,
          type: 'channel' as const,
        })),
      ];

      this.showMentionSuggestions = true;
    });
  }

async sendMessage() {
  const content = this.message.trim();
  if (!content || this.selectedRecipients.length === 0) return;

  const sender = this.currentUserService.getCurrentUser();
  if (!sender) return;

  const attachments: string[] = [];

  for (const file of this.selectedFiles) {
    const path = `chat-files/${Date.now()}_${file.name}`;
    const { url$ } = this.fileService.uploadFile(file, path);
    const url = await new Promise<string>((resolve, reject) => {
      url$.subscribe({ next: resolve, error: reject });
    });
    attachments.push(url);
  }

  const now = new Date();

  for (const recipient of this.selectedRecipients) {
    const msg = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      author: sender.name,
      userId: sender.id,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
      avatar: sender.avatar || 'assets/default-avatar.png',
      createdAt: now,
      reactions: [],
      replies: [],
      ...(attachments.length > 0 && { url: attachments[0] }),
    };

    const isDM = recipient.type === 'user';
    this.channelService.addMessage(recipient.id, msg, isDM);
  }

  const first = this.selectedRecipients[0];

  // Routing nach erfolgreichem Setzen
  if (first.type === 'user') {
    this.channelService.setActiveUserById(first.id);

    this.channelService.activeUser$
      .pipe(
        filter((user): user is CurrentUser => !!user && user.id === first.id),
        take(1)
      )
      .subscribe(() => {
        this.router.navigate([`/app/chat/${first.id}`]);
      });
  } else {
    this.channelService.setActiveChannelByName(first.id);

    this.channelService.activeChannel$
      .pipe(
        filter((channel): channel is Channel => !!channel && channel.name === first.id),
        take(1)
      )
      .subscribe(() => {
        this.router.navigate([`/app/channels/${first.id}`]);
      });
  }

  // Felder zurücksetzen
  this.message = '';
  this.selectedRecipients = [];
  this.selectedFiles = [];
  this.showEmojis = false;
  this.showMentionSuggestions = false;
}

  updateRecipientSuggestions(input: string) {
    const results: Recipient[] = [];

    if (input.startsWith('@')) {
      const query = input.slice(1).toLowerCase();
      results.push(
        ...this.allUsers
          .filter((user) => user.name.toLowerCase().includes(query))
          .map((user) => ({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            label: `@${user.name}`,
            type: 'user' as const,
          }))
      );
    } else if (input.startsWith('#')) {
      const query = input.slice(1).toLowerCase();
      results.push(
        ...this.channelService
          .getChannels()
          .filter((c) => c.name.toLowerCase().includes(query))
          .map((c) => ({
            id: c.name,
            name: c.name,
            avatar: '',
            label: `#${c.name}`,
            type: 'channel' as const,
          }))
      );
    }

    this.filteredRecipients = results;
    this.showRecipientSuggestions = results.length > 0;
  }

  triggerFileInput(): void {
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.click();
    } else {
      console.warn('Datei-Upload-Input ist nicht verfügbar.');
    }
  }
}

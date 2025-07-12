import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../services/channel.service';
import { ThreadPanelService } from '../services/thread.panel.service';
import { ChannelMembersDialogComponent } from '../channel-members-dialog/channel-members-dialog.component';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

interface ChatMessage {
  id: number;
  author: string;
  userId: string;
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
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
})
export class ChatWindowComponent implements OnInit {
  @Input() threadToggle?: () => void;

  newMessage = '';
  showEmojis = false;
  showUsers = false;
  showFullUserList = false;
  hoveredMessage: ChatMessage | null = null;
  replyingTo: ChatMessage | null = null;
  editingMessageId: number | null = null;
  editedMessageContent: string = '';
  mentionMode: 'user' | 'channel' | null = null;
  filteredUsers: ChatUser[] = [];
  filteredChannels: string[] = [];

  activeUser: ChatUser | null = null;
  activeChannelName = '';

  currentChannelMessages: ChatMessage[] = [];
  currentChannelUsers: ChatUser[] = [];
  groupedMessages: { dateLabel: string; messages: ChatMessage[] }[] = [];

  directMessages: { [userId: string]: ChatMessage[] } = {};
  channelMessages: { [channelName: string]: ChatMessage[] } = {};
  channelUsers: { [channelName: string]: ChatUser[] } = {};

  allUsers: ChatUser[] = [
    {
      id: 'frederik',
      name: 'Frederik Beck (Du)',
      avatar: 'assets/Frederik Beck.png',
    },
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    {
      id: 'steffen',
      name: 'Steffen Hoffmann',
      avatar: 'assets/Steffen Hoffmann.png',
    },
  ];

  currentUser: ChatUser;


  emojis = ['😀', '😄', '🚀', '❤️', '👍', '✅', '🎯', '😂'];

constructor(
  private channelService: ChannelService,
  private dialog: MatDialog,
  private threadPanelService: ThreadPanelService
) {
  this.currentUser = this.allUsers.find((u) => u.id === 'frederik')!;
}


  ngOnInit(): void {
    const defaultChannel = 'Entwicklerteam';
    this.activeChannelName = defaultChannel;

    this.channelUsers[defaultChannel] = [
      this.currentUser,
      this.allUsers.find((u) => u.id === 'sofia')!,
      this.allUsers.find((u) => u.id === 'noah')!,
      this.allUsers.find((u) => u.id === 'elise')!,
    ];

    this.channelMessages[defaultChannel] = [
      {
        id: 1,
        author: 'Noah Braun',
        userId: 'noah',
        time: '14:25 Uhr',
        content: 'Welche Version ist aktuell von Angular?',
        avatar: 'assets/Noah Braun.png',
        reactions: [],
        isSelf: false,
        replies: [
          {
            id: 2,
            author: 'Sofia Müller',
            userId: 'sofia',
            time: '14:26 Uhr',
            content: 'Ich glaube 17.1, oder?',
            avatar: 'assets/Sofia Müller.png',
            reactions: [],
            isSelf: false,
            createdAt: new Date(),
          },
          {
            id: 3,
            author: 'Frederik Beck (Du)',
            userId: 'frederik',
            time: '14:27 Uhr',
            content: 'Die aktuelle Version ist 17.2.1.',
            avatar: 'assets/Frederik Beck.png',
            reactions: [],
            isSelf: true,
            createdAt: new Date(),
          },
        ],

        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    ];

    this.currentChannelMessages = this.channelMessages[defaultChannel];
    this.currentChannelUsers = this.channelUsers[defaultChannel];

    this.groupMessagesByDate();

    this.channelService.activeUser$.subscribe((user) => {
      if (user) {
        this.activeUser = user;
        const userId = user.id;

        if (!this.directMessages[userId]) {
          this.directMessages[userId] = [];
        }

        this.currentChannelMessages = this.directMessages[userId];
        this.currentChannelUsers = [this.currentUser, user];
        this.activeChannelName = user.name;

        this.groupMessagesByDate();
      }
    });

    this.channelService.activeChannel$.subscribe((channel) => {
      if (channel) {
        this.activeUser = null;
        const name = channel.name;

        this.activeChannelName = name;
        this.currentChannelUsers = this.channelUsers[name] || [];
        this.currentChannelMessages = this.channelMessages[name] || [];

        this.groupMessagesByDate();
      }
    });
    this.threadPanelService.threadRootMessage$.subscribe((updatedRoot) => {
      if (!updatedRoot) return;

      const channel = this.activeChannelName;
      const messages = this.channelMessages[channel];

      const index = messages.findIndex((msg) => msg.id === updatedRoot.id);
      if (index !== -1) {
        this.channelMessages[channel] = [
          ...messages.slice(0, index),
          updatedRoot,
          ...messages.slice(index + 1),
        ];
        this.currentChannelMessages = this.channelMessages[channel];

        this.groupMessagesByDate();
      }
    });
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content) return;

    const now = new Date();
    const isDirectMessage = !!this.activeUser;

    const message: ChatMessage = {
      id: this.currentChannelMessages.length + 1,
      author: this.currentUser.name,
      userId: this.currentUser.id,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
      avatar: this.currentUser.avatar,
      reactions: [],
      isSelf: true,
      replies: [],
      createdAt: now,
    };

    if (isDirectMessage) {
      const userId = this.activeUser!.id;
      if (!this.directMessages[userId]) {
        this.directMessages[userId] = [];
      }
      this.directMessages[userId].push(message);
      this.currentChannelMessages = this.directMessages[userId];
    } else {
      if (this.replyingTo) {
        if (!this.replyingTo.replies) this.replyingTo.replies = [];
        this.replyingTo.replies.push(message);
      } else {
        const channel = this.activeChannelName;
        if (!this.channelMessages[channel]) {
          this.channelMessages[channel] = [];
        }
        this.channelMessages[channel].push(message);
        this.currentChannelMessages = this.channelMessages[channel];
      }
    }

    this.newMessage = '';
    this.replyingTo = null;
    this.showEmojis = false;
    this.showUsers = false;

    this.groupMessagesByDate();
  }

  groupMessagesByDate(): void {
    const groups: { [key: string]: ChatMessage[] } = {};
    for (const message of this.currentChannelMessages) {
      const key = this.getDateKey(message.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(message);
    }

    this.groupedMessages = Object.entries(groups).map(([key, messages]) => ({
      dateLabel: this.formatDateLabel(key),
      messages,
    }));
  }

  getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateLabel(dateKey: string): string {
    const today = new Date();
    const date = new Date(dateKey);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Heute';
    if (date.toDateString() === yesterday.toDateString()) return 'Gestern';

    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  toggleEmojiPicker() {
    this.showEmojis = !this.showEmojis;
    this.showUsers = false;
  }

  toggleUserList() {
    const lastChar = this.newMessage.slice(-1);

    if (lastChar === '@') {
      this.mentionMode = 'user';

      if (this.activeUser) {
        this.filteredUsers = [this.currentUser, this.activeUser];
      } else {
        this.filteredUsers = [...this.currentChannelUsers];
      }

      this.showUsers = true;
      this.showEmojis = false;
    } else if (lastChar === '#') {
      this.mentionMode = 'channel';
      this.filteredChannels = Object.keys(this.channelUsers);
      this.showUsers = true;
      this.showEmojis = false;
    } else {
      this.showUsers = false;
    }
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojis = false;
  }
  replyTo(message: ChatMessage) {
    const mention = message.author ? `@${message.author} ` : '';

    if (this.activeUser) {
      this.replyingTo = message;
      this.newMessage = mention;

      setTimeout(() => {
        const input = document.querySelector('input');
        input?.focus();
      }, 0);
    } else {
      this.threadPanelService.openThread(message, mention);
      this.threadToggle?.();
      this.replyingTo = null;
    }
  }

  toggleReaction(message: ChatMessage, emoji: string) {
    if (!message.reactions) message.reactions = [];

    const reaction = message.reactions.find((r) => r.emoji === emoji);
    const userId = this.currentUser.id;

    if (reaction) {
      const idx = reaction.users.indexOf(userId);
      if (idx !== -1) {
        reaction.users.splice(idx, 1);
        reaction.count--;
        if (reaction.count === 0) {
          message.reactions = message.reactions.filter((r) => r.count > 0);
        }
      } else {
        reaction.users.push(userId);
        reaction.count++;
      }
    } else {
      message.reactions.push({ emoji, count: 1, users: [userId] });
    }
  }

  getLastReplyTime(message: ChatMessage): string {
    return message.replies?.[message.replies.length - 1]?.time ?? '';
  }

  getUserNamesFromIds(ids: string[]): string[] {
    return this.currentChannelUsers
      .filter((u) => ids.includes(u.id))
      .map((u) => u.name);
  }

  toggleUserDropdown() {
    setTimeout(() => (this.showFullUserList = !this.showFullUserList));
  }

  @ViewChild('userDropdownRef') userDropdownRef!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.showFullUserList || !this.userDropdownRef) return;
    const clickedInside = this.userDropdownRef.nativeElement.contains(
      event.target
    );
    if (!clickedInside) this.showFullUserList = false;
  }

  openAddUserDialog() {
    const dialogRef = this.dialog.open(ChannelMembersDialogComponent, {
      width: '500px',
      data: {
        mode: 'add',
        channelName: this.activeChannelName,
        existingMembers: this.currentChannelUsers.map((u) => u.name),
      },
    });

    dialogRef.afterClosed().subscribe((newUsers: ChatUser[]) => {
      if (newUsers?.length) {
        const filtered = newUsers.filter(
          (u) => !this.currentChannelUsers.find((m) => m.id === u.id)
        );
        this.currentChannelUsers = [...this.currentChannelUsers, ...filtered];
        this.channelUsers[this.activeChannelName] = this.currentChannelUsers;
      }
    });
  }

  startEditing(message: ChatMessage) {
    this.editingMessageId = message.id;
    this.editedMessageContent = message.content;
  }

  cancelEdit() {
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

  onMessageInput() {
    const match = this.newMessage.match(/[@#](\w*)$/);
    if (match) {
      const term = match[1].toLowerCase();

      if (this.mentionMode === 'user') {
        const availableUsers = this.activeUser
          ? [this.currentUser, this.activeUser]
          : this.currentChannelUsers;

        this.filteredUsers = availableUsers.filter((user) =>
          user.name.toLowerCase().includes(term)
        );
      } else if (this.mentionMode === 'channel') {
        this.filteredChannels = Object.keys(this.channelUsers).filter((name) =>
          name.toLowerCase().includes(term)
        );
      }

      this.showUsers = true;
    } else {
      this.showUsers = false;
    }
  }

  mentionUser(user: ChatUser) {
    this.newMessage = this.newMessage.replace(/@\w*$/, `@${user.name} `);
    this.showUsers = false;
    this.mentionMode = null;
  }

  mentionChannel(name: string) {
    this.newMessage = this.newMessage.replace(/#\w*$/, `#${name} `);
    this.showUsers = false;
    this.mentionMode = null;
  }

get isSelfChat(): boolean {
  return this.activeUser?.id === this.currentUser?.id;
}


}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit {
  newMessage = '';
  showEmojis = false;
  showUsers = false;
  hoveredMessage: ChatMessage | null = null;
  replyingTo: ChatMessage | null = null;

  groupedMessages: { dateLabel: string; messages: ChatMessage[] }[] = [];

  currentUser: ChatUser = {
    id: 'frederik',
    name: 'Frederik Beck (Du)',
    avatar: 'assets/Frederik Beck.png'
  };

  emojis = ['😀', '😄', '🚀', '❤️', '👍', '✅', '🎯', '😂'];

  teamUsers: ChatUser[] = [
    this.currentUser,
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
  ];

  messages: ChatMessage[] = [
    {
      id: 1,
      author: 'Noah Braun',
      userId: 'noah',
      time: '14:25 Uhr',
      content: 'Welche Version ist aktuell von Angular?',
      avatar: 'assets/Noah Braun.png',
      reactions: [{ emoji: '👍', count: 1, users: ['sofia'] }],
      isSelf: false,
      replies: [],
      createdAt: new Date(new Date().setDate(new Date().getDate() - 1)) // gestern
    },
    {
      id: 2,
      author: 'Frederik Beck (Du)',
      userId: 'frederik',
      time: '15:06 Uhr',
      content: 'Lorem ipsum dolor sit amet...blablablablablabla',
      avatar: 'assets/Frederik Beck.png',
      reactions: [
        { emoji: '🚀', count: 1, users: ['sofia'] },
        { emoji: '✅', count: 1, users: ['sofia'] },
        { emoji: '😂', count: 1, users: ['noah'] }
      ],
      isSelf: true,
      replies: [],
      createdAt: new Date() // heute
    }
  ];

  ngOnInit(): void {
    this.groupMessagesByDate();
  }

  groupMessagesByDate(): void {
    const groups: { [key: string]: ChatMessage[] } = {};

    for (const message of this.messages) {
      const dateKey = this.getDateKey(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    }

    this.groupedMessages = Object.keys(groups).map(key => ({
      dateLabel: this.formatDateLabel(key),
      messages: groups[key]
    }));
  }

  getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }

  formatDateLabel(dateKey: string): string {
    const today = new Date();
    const date = new Date(dateKey);
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isToday) return 'Heute';
    if (date.toDateString() === yesterday.toDateString()) return 'Gestern';

    return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content) return;

    const now = new Date();
    const newMsg: ChatMessage = {
      id: this.messages.length + 1,
      author: this.currentUser.name,
      userId: this.currentUser.id,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
      avatar: this.currentUser.avatar,
      reactions: [],
      isSelf: true,
      replies: [],
      createdAt: now
    };

    if (this.replyingTo) {
      newMsg.replyToId = this.replyingTo.id;
      const parent = this.messages.find(m => m.id === this.replyingTo?.id);
      parent?.replies?.push(newMsg);
      this.replyingTo = null;
    } else {
      this.messages.push(newMsg);
    }

    this.newMessage = '';
    this.showEmojis = false;
    this.showUsers = false;
    this.groupMessagesByDate(); 
  }

  toggleEmojiPicker(): void {
    this.showEmojis = !this.showEmojis;
    this.showUsers = false;
  }

  toggleUserList(): void {
    this.showUsers = !this.showUsers;
    this.showEmojis = false;
  }

  addEmoji(emoji: string): void {
    this.newMessage += emoji;
    this.showEmojis = false;
  }

  mentionUser(user: ChatUser): void {
    this.newMessage += `@${user.name} `;
    this.showUsers = false;
  }

  replyTo(message: ChatMessage): void {
    this.replyingTo = message;
    this.newMessage = `@${message.author} `;
  }

  toggleReaction(message: ChatMessage, emoji: string): void {
    const existing = message.reactions?.find(r => r.emoji === emoji);
    if (existing) {
      const hasReacted = existing.users.includes(this.currentUser.id);
      if (hasReacted) {
        existing.users = existing.users.filter(u => u !== this.currentUser.id);
        existing.count--;
      } else {
        existing.users.push(this.currentUser.id);
        existing.count++;
      }
    } else {
      if (!message.reactions) message.reactions = [];
      message.reactions.push({ emoji, count: 1, users: [this.currentUser.id] });
    }
  }

  getLastReplyTime(message: ChatMessage): string {
    if (!message.replies?.length) return '';
    return message.replies[message.replies.length - 1].time;
  }

  getUserNamesFromIds(ids: string[]): string[] {
    return this.teamUsers.filter(u => ids.includes(u.id)).map(u => u.name);
  }
}

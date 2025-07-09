import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventEmitter, Output } from '@angular/core';


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
  styleUrls: ['./thread-panel.component.scss']
})
export class ThreadPanelComponent {
  currentUserId = 'frederik';
  newMessage = '';
  showEmojis = false;
  showUsers = false;
  replyToUser: string | null = null;
  hoveredMessageId: number | null = null;

  emojis: string[] = ['😀', '😂', '😅', '😍', '😎', '😢', '👍', '👎', '❤️', '🔥', '🎯', '👏'];

  allUsers = [
    { id: 'frederik', name: 'Frederik Beck (Du)', avatar: 'assets/Frederik Beck.png' },
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
  ];

  threadMessages = [
    {
      id: 1,
      userId: 'noah',
      author: 'Noah Braun',
      time: '14:25 Uhr',
      avatar: 'assets/Noah Braun.png',
      content: 'Welche Version ist aktuell von Angular?',
      reactions: []
    },
    {
      id: 2,
      userId: 'sofia',
      author: 'Sofia Müller',
      time: '14:30 Uhr',
      avatar: 'assets/Sofia Müller.png',
      content: 'Ich habe die gleiche Frage. Ich habe gegoogelt und es scheint ...',
      reactions: [
        { emoji: '👍', count: 1, users: ['frederik'] },
        { emoji: '😄', count: 1, users: ['noah'] }
      ]
    },
    {
      id: 3,
      userId: 'frederik',
      author: 'Frederik Beck (Du)',
      time: '15:06 Uhr',
      avatar: 'assets/Frederik Beck.png',
      content: 'Ja das ist es.',
      reactions: [
        { emoji: '🎯', count: 1, users: ['sofia'] },
        { emoji: '👍', count: 1, users: ['sofia'] }
      ]
    }
  ];

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

  mentionUser(user: { name: string }): void {
    this.newMessage += `@${user.name} `;
    this.showUsers = false;
  }

  replyTo(user: string): void {
    this.replyToUser = user;
    this.newMessage = `@${user} `;
  }

  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    this.threadMessages.push({
      id: this.threadMessages.length + 1,
      userId: this.currentUserId,
      author: 'Frederik Beck (Du)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: 'assets/Frederik Beck.png',
      content: trimmed,
      reactions: []
    });

    this.newMessage = '';
    this.replyToUser = null;
    this.showEmojis = false;
    this.showUsers = false;
  }

  getUserNameFromId(id: string): string {
    return this.allUsers.find(u => u.id === id)?.name || id;
  }

  getUserNamesFromIds(ids: string[]): string[] {
    return ids.map(id => this.getUserNameFromId(id));
  }

  toggleReaction(message: any, emoji: string): void {
    const reaction = message.reactions.find((r: any) => r.emoji === emoji);
    if (reaction) {
      if (!reaction.users.includes(this.currentUserId)) {
        reaction.users.push(this.currentUserId);
        reaction.count++;
      }
    } else {
      message.reactions.push({ emoji, count: 1, users: [this.currentUserId] });
    }
  }

  getLastReplyTime(): string {
    return this.threadMessages[this.threadMessages.length - 1].time;
  }

  @Output() closePanel = new EventEmitter<void>();

closeThreadPanel() {
  this.closePanel.emit();
}

}

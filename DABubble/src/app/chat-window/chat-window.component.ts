import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface ChatMessage {
  author: string;
  time: string;
  content: string;
  reactions?: string[];
  isSelf?: boolean;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent {
  messages: ChatMessage[] = [
    {
      author: 'Noah Braun',
      time: '14:25 Uhr',
      content: 'Welche Version ist aktuell von Angular?',
      reactions: ['✅', '👍', '💬'],
    },
    {
      author: 'Frederik Beck (Du)',
      time: '15:06 Uhr',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque blandit odio efficitur lectus vestibulum, quis accumsan ante vulputate. Quisque tristique iaculis erat, eu faucibus lacus iaculis ac.',
      reactions: ['🚀 1', '✅ 1', '😂'],
      isSelf: true
    }
  ];

  newMessage = '';

  sendMessage() {
    const content = this.newMessage.trim();
    if (!content) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.messages.push({
      author: 'Frederik Beck (Du)',
      time,
      content,
      isSelf: true
    });

    this.newMessage = '';
  }
}

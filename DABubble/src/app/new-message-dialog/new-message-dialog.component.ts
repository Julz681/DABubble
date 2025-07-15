import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-new-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './new-message-dialog.component.html',
  styleUrls: ['./new-message-dialog.component.scss']
})
export class NewMessageDialogComponent {
  inputValue = '';
  message = '';
  selectedRecipients: string[] = [];

  showSuggestions = false;
  filteredSuggestions: { name: string; avatarUrl?: string }[] = [];
  isUserMode = false;

  channels = ['Entwicklerteam'];

  users = [
    {
      id: 'sofia',
      name: 'Sofia Müller',
      avatarUrl: 'assets/Sofia Müller.png'
    },
    {
      id: 'noah',
      name: 'Noah Braun',
      avatarUrl: 'assets/Noah Braun.png'
    },
    {
      id: 'frederik',
      name: 'Frederik Beck (Du)',
      avatarUrl: 'assets/Frederik Beck.png'
    },
    {
      id: 'elise',
      name: 'Elise Roth',
      avatarUrl: 'assets/Elise Roth.png'
    },
    {
      id: 'elias',
      name: 'Elias Neumann',
      avatarUrl: 'assets/Elias Neumann.png'
    },
    {
      id: 'steffen',
      name: 'Steffen Hoffmann',
      avatarUrl: 'assets/Steffen Hoffmann.png'
    }
  ];

  constructor(private dialogRef: MatDialogRef<NewMessageDialogComponent>) {}

  onRecipientInput(): void {
    const val = this.inputValue.trim();
    if (val.startsWith('#')) {
      this.isUserMode = false;
      const q = val.slice(1).toLowerCase();
      this.filteredSuggestions = this.channels
        .filter(c => c.toLowerCase().includes(q))
        .map(c => ({ name: c }));
      this.showSuggestions = true;
    } else if (val.startsWith('@')) {
      this.isUserMode = true;
      const q = val.slice(1).toLowerCase();
      this.filteredSuggestions = this.users
        .filter(u => u.name.toLowerCase().includes(q))
        .map(u => ({ name: u.name, avatarUrl: u.avatarUrl }));
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: { name: string; avatarUrl?: string }): void {
    const prefix = this.isUserMode ? '@' : '#';
    const full = prefix + suggestion.name;
    if (!this.selectedRecipients.includes(full)) {
      this.selectedRecipients.push(full);
    }
    this.inputValue = '';
    this.showSuggestions = false;
  }

  onEnter(): void {
    if (this.filteredSuggestions.length === 1) {
      this.selectSuggestion(this.filteredSuggestions[0]);
    }
  }

  removeRecipient(index: number): void {
    this.selectedRecipients.splice(index, 1);
  }

  send(): void {
    if (!this.message.trim() || this.selectedRecipients.length === 0) {
      return;
    }

    const results = this.selectedRecipients.map(r => {
      const isUser = r.startsWith('@');
      const name = r.slice(1).trim();

      if (isUser) {
        const user = this.users.find(u => u.name === name);
        return user
          ? {
              type: 'user',
              id: user.id,
              name: user.name,
              message: this.message
            }
          : null;
      } else {
        const channel = this.channels.find(c => c === name);
        return channel
          ? {
              type: 'channel',
              id: name,
              name: name,
              message: this.message
            }
          : null;
      }
    }).filter(Boolean);

    this.dialogRef.close(results);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

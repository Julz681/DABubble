import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-new-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './new-message-dialog.component.html',
  styleUrls: ['./new-message-dialog.component.scss']
})
export class NewMessageDialogComponent {
  inputValue = '';
  message = '';
  recipient: string = '';


  selectedRecipients: string[] = [];

  showSuggestions = false;
  filteredSuggestions: string[] = [];
  isUserMode = false;

  channels = ['Entwicklerteam'];
  users = [
    { id: 'sofia', name: 'Sofia Müller' },
    { id: 'noah', name: 'Noah Braun' },
    { id: 'frederik', name: 'Frederik Beck (Du)' },
    { id: 'elise', name: 'Elise Roth' },
    { id: 'elias', name: 'Elias Neumann' },
    { id: 'steffen', name: 'Steffen Hoffmann' }
  ];

  constructor(private dialogRef: MatDialogRef<NewMessageDialogComponent>) {}

  onRecipientInput(): void {
    const val = this.inputValue.trim();
    if (val.startsWith('#')) {
      this.isUserMode = false;
      const q = val.slice(1).toLowerCase();
      this.filteredSuggestions = this.channels.filter(c =>
        c.toLowerCase().includes(q)
      );
      this.showSuggestions = true;
    } else if (val.startsWith('@')) {
      this.isUserMode = true;
      const q = val.slice(1).toLowerCase();
      this.filteredSuggestions = this.users
        .filter(u => u.name.toLowerCase().includes(q))
        .map(u => u.name);
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string): void {
    const prefix = this.isUserMode ? '@' : '#';
    const full = prefix + suggestion;
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

send() {
  if (this.message.trim() && this.recipient.trim()) {
    this.dialogRef.close({
      recipient: this.recipient,
      message: this.message
    });
  }
}


  cancel(): void {
    this.dialogRef.close();
  }
}

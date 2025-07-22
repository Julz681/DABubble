import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-members-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './app-add-members-dialog.component.html',
  styleUrls: ['./app-add-members-dialog.component.scss'],
})
export class AddMembersDialogComponent {
  allUsers = [
    { name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    { name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' }
  ];

  selectedUsers: any[] = [];
  search = '';

  constructor(
    public dialogRef: MatDialogRef<AddMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { existingMembers?: string[] }
  ) {}

  filteredUsers() {
    return this.allUsers.filter(
      user =>
        !this.selectedUsers.some(s => s.name === user.name) &&
        !(this.data.existingMembers || []).includes(user.name) &&
        user.name.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  addUser(user: any) {
    this.selectedUsers.push(user);
    this.search = '';
  }

  removeUser(user: any) {
    this.selectedUsers = this.selectedUsers.filter(u => u !== user);
  }

close() {
  console.debug('[DEBUG] Dialog wird geschlossen mit:', this.selectedUsers);
  this.dialogRef.close(this.selectedUsers);
}

}

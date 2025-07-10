import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-channel-members-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './channel-members-dialog.component.html',
  styleUrls: ['./channel-members-dialog.component.scss']
})
export class ChannelMembersDialogComponent {
  allUsers = [
    { name: 'Frederik Beck', avatar: 'assets/Frederik Beck.png' },
    { name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    { name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' }
  ];

  mode: 'selected' | 'all' = 'selected';
  search = '';
  selectedUsers: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ChannelMembersDialogComponent>
  ) {}

  filteredUsers() {
    return this.allUsers.filter(u =>
      u.name.toLowerCase().includes(this.search.toLowerCase()) &&
      !this.selectedUsers.includes(u)
    );
  }

  addUser(user: any) {
    this.selectedUsers.push(user);
    this.search = '';
  }

  confirm() {
    const members = this.mode === 'all' ? this.allUsers : this.selectedUsers;
    this.dialogRef.close(members);
  }
}

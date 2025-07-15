import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-channel-members-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatTooltipModule
  ],
  templateUrl: './channel-members-dialog.component.html',
  styleUrls: ['./channel-members-dialog.component.scss']
})
export class ChannelMembersDialogComponent {
  allUsers = [
    { name: 'Frederik Beck (Du)', avatar: 'assets/Frederik Beck.png' },
    { name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    { name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' }
  ];

  search = '';
  selectedUsers: any[] = [];

  mode: 'all' | 'selected' = 'selected';

  constructor(
    public dialogRef: MatDialogRef<ChannelMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      channelName?: string;
      mode: 'creation' | 'add';
      existingMembers?: string[];
    }
  ) {
    if (data.mode === 'creation') {
      this.mode = 'all';
    }
  }

  filteredUsers() {
    const alreadyInChannel = this.data.existingMembers || [];

return this.allUsers.filter(user =>
  !alreadyInChannel.includes(user.name) &&
  !this.selectedUsers.some(s => s.name === user.name) &&
  user.name.toLowerCase().includes(this.search.toLowerCase())
);

  }

  addUser(user: any) {
    if (!this.selectedUsers.some(u => u.name === user.name)) {
      this.selectedUsers.push(user);
      this.search = '';
    }
  }

  confirm() {
const result = this.mode === 'all'
  ? this.allUsers
  : this.selectedUsers;


    this.dialogRef.close(result);
  }
}

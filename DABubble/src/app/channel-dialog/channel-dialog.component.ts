import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { ChannelMembersDialogComponent } from '../channel-members-dialog/channel-members-dialog.component';
import { CurrentUserService, CurrentUser } from '../services/current.user.service';

@Component({
  selector: 'app-channel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './channel-dialog.component.html',
  styleUrls: ['./channel-dialog.component.scss'],
})
export class ChannelDialogComponent {
  channelName = '';
  description = '';
  currentUser: CurrentUser;

  constructor(
    private dialogRef: MatDialogRef<ChannelDialogComponent>,
    private dialog: MatDialog,
    private currentUserService: CurrentUserService
  ) {
    this.currentUser = this.currentUserService.getCurrentUser();
  }

  nextStep() {
    if (!this.channelName.trim()) return;

    const dialogRef = this.dialog.open(ChannelMembersDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      data: {
        mode: 'creation',
      },
    });

    dialogRef.afterClosed().subscribe((members: CurrentUser[]) => {
      if (members) {
        const allMembers: CurrentUser[] = [
          this.currentUser,
          ...members.filter((m) => m.id !== this.currentUser.id),
        ];

        this.dialogRef.close({
          name: this.channelName,
          description: this.description,
          members: allMembers,
          createdBy: this.currentUser.name,
        });
      }
    });
  }
}

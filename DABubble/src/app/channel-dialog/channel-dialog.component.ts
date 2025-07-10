import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ChannelMembersDialogComponent } from '../channel-members-dialog/channel-members-dialog.component';

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
    MatIconModule
  ],
  templateUrl: './channel-dialog.component.html',
  styleUrls: ['./channel-dialog.component.scss']
})
export class ChannelDialogComponent {
  channelName = '';
  description = '';

  constructor(
    private dialogRef: MatDialogRef<ChannelDialogComponent>,
    private dialog: MatDialog
  ) {}

  nextStep() {
    if (!this.channelName.trim()) return;

    const dialogRef = this.dialog.open(ChannelMembersDialogComponent, {
      width: '500px',
      data: { name: this.channelName, description: this.description }
    });

    dialogRef.afterClosed().subscribe((members) => {
      if (members) {
        this.dialogRef.close({
          name: this.channelName,
          description: this.description,
          members
        });
      }
    });
  }
}

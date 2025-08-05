import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
  constructor(
    public dialogRef: MatDialogRef<UserProfileComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string; name: string; email: string; avatar: string }
  ) {}

  close() {
    this.dialogRef.close();
  }

  startChat() {
    this.dialogRef.close({ startChatWith: this.data });
  }
}

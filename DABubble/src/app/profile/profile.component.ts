import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CurrentUserService } from '../services/current.user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  fullName: string = '';
  editedName: string = '';
  selectedAvatar: string = '';
  isEditing = false;

  availableAvatars: string[] = [
    'assets/Frederik Beck.png',
    'assets/Sofia Müller.png',
    'assets/Noah Braun.png',
    'assets/Elise Roth.png',
    'assets/Elias Neumann.png',
    'assets/Steffen Hoffmann.png',
  ];

  constructor(
    private dialogRef: MatDialogRef<ProfileComponent>,
    private currentUserService: CurrentUserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.currentUserService.getCurrentUser();
    this.fullName = currentUser.name;
    this.editedName = currentUser.name;
    this.selectedAvatar = currentUser.avatar;
  }

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.isEditing = true;
  }

  cancel(): void {
    this.isEditing = false;
    const currentUser = this.currentUserService.getCurrentUser();
    this.editedName = currentUser.name;
    this.selectedAvatar = currentUser.avatar;
  }

  save(): void {
    const trimmedName = this.editedName.trim();
    if (trimmedName) {
      this.currentUserService.updateName(trimmedName);
      this.currentUserService.updateAvatar(this.selectedAvatar);
      this.fullName = trimmedName;
      this.isEditing = false;
      this.dialogRef.close(trimmedName);
    }
  }

  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  get currentUserEmail(): string {
    return this.authService.currentUser?.email ?? 'Unbekannt';
  }
}

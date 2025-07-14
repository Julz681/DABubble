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
  isEditing = false;

  constructor(
    private dialogRef: MatDialogRef<ProfileComponent>,
    private currentUserService: CurrentUserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.currentUserService.getCurrentUser();
    this.fullName = currentUser.name;
    this.editedName = currentUser.name;
  }

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.isEditing = true;
  }

  cancel(): void {
    this.isEditing = false;
    this.editedName = this.fullName;
  }

  save(): void {
    if (this.editedName.trim()) {
      this.fullName = this.editedName.trim();
      this.currentUserService.updateName(this.fullName); 
      this.isEditing = false;
      this.dialogRef.close(this.fullName);
    }
  }

  get userDisplayName(): string {
  return this.authService.currentUser?.displayName ?? 'Unbekannt';
}

}

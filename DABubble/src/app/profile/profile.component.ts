import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

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
export class ProfileComponent {
  fullName: string = '';
  editedName: string = '';
  isEditing = false;

  constructor(private dialogRef: MatDialogRef<ProfileComponent>) {}

  ngOnInit() {
    this.fullName = localStorage.getItem('username') || 'Frederik Beck';
    this.editedName = this.fullName;
  }

  close() {
    this.dialogRef.close();
  }

  edit() {
    this.isEditing = true;
  }

  cancel() {
    this.isEditing = false;
  }

  save() {
    this.fullName = this.editedName;
    localStorage.setItem('username', this.fullName);
    this.isEditing = false;
    this.dialogRef.close(this.fullName);
  }
}

import { Component } from '@angular/core';
import { ChatLayoutComponent } from '../chat-layout/chat-layout.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// @ts-ignore
import { ProfileComponent } from '../profile/profile.component';


@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, ChatLayoutComponent, MatIconModule, MatDialogModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  dropdownOpen = false;

  constructor(private router: Router, private dialog: MatDialog) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  openProfileDialog() {
    this.dropdownOpen = false;
    this.dialog.open(ProfileComponent, {
      width: '360px',
      panelClass: 'custom-dialog-container'
    });
  }

  get userName(): string {
    return localStorage.getItem('username') || 'Unbekannt';
  }
}

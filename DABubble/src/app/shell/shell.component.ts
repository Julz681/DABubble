import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
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
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  dropdownOpen = false;
  _userName = localStorage.getItem('username') || 'Unbekannt';

  @ViewChild('dropdownContainer') dropdownRef!: ElementRef;

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  get userName(): string {
    return this._userName;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  openProfileDialog() {
    this.dropdownOpen = false;

    const dialogRef = this.dialog.open(ProfileComponent, {
      width: '360px',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        this._userName = result;
      }
    });
  }

  // ✅ Klick außerhalb des Dropdowns schließt das Menü
  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const clickedInside = this.dropdownRef?.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }
}

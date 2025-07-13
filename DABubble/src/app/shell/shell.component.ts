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
import { ChannelService } from '../services/channel.service';
import { CurrentUserService } from '../services/current.user.service';
import { FormsModule } from '@angular/forms';

// @ts-ignore
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, ChatLayoutComponent, MatIconModule, MatDialogModule,FormsModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  dropdownOpen = false;
  _userName = localStorage.getItem('username') || 'Unbekannt';

  @ViewChild('dropdownContainer') dropdownRef!: ElementRef;

  // Suchfunktion
  searchTerm = '';
  searchFocused = false;
  filteredResults: Array<{ type: 'channel' | 'user'; display: string; id: string }> = [];


  constructor(
    private router: Router,
    private dialog: MatDialog,
    private channelService: ChannelService,
    private currentUserService: CurrentUserService
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

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const clickedInside = this.dropdownRef?.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.dropdownOpen = false;
      this.searchFocused = false;
    }
  }

onSearch() {
  const term = this.searchTerm.toLowerCase();

  const channels = this.channelService.getChannels()
    .filter(c => c.name.toLowerCase().includes(term))
    .map(c => ({ type: 'channel' as const, display: `#${c.name}`, id: c.name }));

  const users = this.currentUserService.getAllUsers()
    .filter(u => u.name.toLowerCase().includes(term))
    .map(u => ({ type: 'user' as const, display: u.name, id: u.id }));

  this.filteredResults = [...channels, ...users];
}


  onBlur() {
    setTimeout(() => (this.searchFocused = false), 150);
  }

  selectResult(result: { type: 'channel' | 'user'; id: string }) {
    if (result.type === 'channel') {
      const channel = this.channelService.getChannels().find(c => c.name === result.id);
      if (channel) this.channelService.setActiveChannel(channel);
    } else {
      const user = this.currentUserService.getAllUsers().find(u => u.id === result.id);
      if (user) this.channelService.setActiveUser(user);
    }

    this.searchTerm = '';
    this.filteredResults = [];
    this.searchFocused = false;
  }
}

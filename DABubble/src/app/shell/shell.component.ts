import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChannelService } from '../services/channel.service';
import {
  CurrentUserService,
  CurrentUser,
} from '../services/current.user.service';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ProfileComponent } from '../profile/profile.component';
import { MatTooltipModule } from '@angular/material/tooltip';

interface SearchResult {
  name: string;
  avatar?: string;
  type: 'user' | 'channel';
  id: string;
}


@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    RouterOutlet,
    MatTooltipModule
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  dropdownOpen = false;
  searchTerm = '';
  searchFocused = false;

  users: CurrentUser[] = [];
  currentUser!: CurrentUser;

filteredResults: SearchResult[] = [];


  @ViewChild('dropdownContainer') dropdownRef!: ElementRef;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private channelService: ChannelService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    // Aktuellen User abonnieren (für Anzeige im Header)
    this.currentUserService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Nutzerliste abonnieren (für Suchfunktion)
    this.currentUserService.users$.subscribe((users) => {
      this.users = users;
    });

    // 👇 Hole gespeicherten Namen aus localStorage (falls vorhanden)
    const savedName = localStorage.getItem('username');
    if (savedName && (!this.currentUser || this.currentUser.name !== savedName)) {
      this.currentUserService.updateName(savedName);
    }
  }

  get userName(): string {
    return this.currentUser?.name || 'Unbekannt';
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
    panelClass: 'profile-dialog',
    position: {
      top: '70px',
      right: '16px'
    },
    hasBackdrop: false // Optional: wenn du kein Overlay willst
  });

  dialogRef.afterClosed().subscribe((result: string | undefined) => {
    if (result) {
      this.currentUserService.updateName(result);
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

  const channels: SearchResult[] = this.channelService.getChannels()
    .filter((c) => c.name.toLowerCase().includes(term))
    .map((c) => ({
      type: 'channel',
      name: c.name,
      id: c.name,
    }));

  const users: SearchResult[] = this.users
    .filter((u) => u.name.toLowerCase().includes(term))
    .map((u) => ({
      type: 'user',
      name: u.name,
      id: u.id,
      avatar: u.avatar,
    }));

  this.filteredResults = [...channels, ...users];
}


  onBlur() {
    setTimeout(() => (this.searchFocused = false), 150);
  }

  selectResult(result: { type: 'channel' | 'user'; id: string }) {
    if (result.type === 'channel') {
      const channel = this.channelService
        .getChannels()
        .find((c) => c.name === result.id);
      if (channel) this.channelService.setActiveChannel(channel);
    } else {
      const user = this.users.find((u) => u.id === result.id);
      if (user) this.channelService.setActiveUser(user);
    }

    this.searchTerm = '';
    this.filteredResults = [];
    this.searchFocused = false;
  }
}

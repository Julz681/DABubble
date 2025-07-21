import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ChannelService } from '../services/channel.service';
import { CurrentUserService, CurrentUser } from '../services/current.user.service';
import { ProfileComponent } from '../profile/profile.component';
import { MobileViewService } from '../services/mobile-view.service';

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
    MatTooltipModule,
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit, OnDestroy {
  dropdownOpen = false;
  searchTerm = '';
  searchFocused = false;

  currentUser!: CurrentUser;
  users: CurrentUser[] = [];
  filteredResults: SearchResult[] = [];

  currentMobileView: 'sidebar' | 'main' | 'thread' = 'sidebar';
  isMobile = false;

  private subscriptions = new Subscription();

  @ViewChild('dropdownContainer') dropdownRef!: ElementRef;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private channelService: ChannelService,
    private currentUserService: CurrentUserService,
    private mobileViewService: MobileViewService,
  ) {}

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 900;

    this.subscriptions.add(
      this.mobileViewService.mobileView$.subscribe(view => {
        this.currentMobileView = view;
      })
    );

    this.subscriptions.add(
      this.currentUserService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    this.subscriptions.add(
      this.currentUserService.users$.subscribe(users => {
        this.users = users;
      })
    );

    const savedName = localStorage.getItem('username');
    if (savedName && (!this.currentUser || this.currentUser.name !== savedName)) {
      this.currentUserService.updateName(savedName);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
        right: '16px',
      },
      hasBackdrop: false,
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
      .filter(c => c.name.toLowerCase().includes(term))
      .map(c => ({
        type: 'channel',
        name: c.name,
        id: c.name,
      }));

    const users: SearchResult[] = this.users
      .filter(u => u.name.toLowerCase().includes(term))
      .map(u => ({
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
      const channel = this.channelService.getChannels().find(c => c.name === result.id);
      if (channel) this.channelService.setActiveChannel(channel);
    } else {
      const user = this.users.find(u => u.id === result.id);
      if (user) this.channelService.setActiveUser(user);
    }

    this.searchTerm = '';
    this.filteredResults = [];
    this.searchFocused = false;
  }

  setMobileView(view: 'sidebar' | 'main' | 'thread') {
    this.mobileViewService.setView(view);
  }
}

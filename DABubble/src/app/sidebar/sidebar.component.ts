import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { HostListener } from '@angular/core';


import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';
import { ChannelInfoDialogComponent } from '../channel-info-dialog/channel-info-dialog.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

import { ChannelService, Channel } from '../services/channel.service';
import {
  CurrentUserService,
  CurrentUser
} from '../services/current.user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() composeNewMessage = new EventEmitter<void>();
  @Output() chatSelected = new EventEmitter<void>();


  currentUser!: CurrentUser;
  users: CurrentUser[] = [];
  channels: Channel[] = [];

  showChannels = true;
  showDMs = true;
  isMobile = window.innerWidth <= 900;
isSidebarCollapsed = false;
showNewMessageView = false;


  constructor(
    private channelService: ChannelService,
    private cdr: ChangeDetectorRef,
    private currentUserService: CurrentUserService,
    private dialog: MatDialog
  ) {}

ngOnInit() {
  this.currentUserService.currentUser$.subscribe((user) => {
    this.currentUser = user;

    // ⬅️ HIER einfügen
    this.updateUserInList(user);

    const users = this.currentUserService.getAllUsers();

    // Falls der eigene User noch nicht in der Liste ist:
    const exists = users.find(u => u.id === user.id);
    if (!exists) {
      users.unshift(user);
    }

    // Sortieren: eigener User ganz oben
    this.users = users.sort((a, b) => {
      if (a.id === user.id) return -1;
      if (b.id === user.id) return 1;
      return a.name.localeCompare(b.name);
    });

    this.channelService.users = [...this.users];

    this.initDefaultChannel(user);
    this.cdr.detectChanges();
  });

  this.channelService.channels$.subscribe((channels) => {
    this.channels = channels;
  });
}




  initDefaultChannel(user: CurrentUser) {
    if (this.channelService.getChannels().length === 0) {
      const defaultMembers = [
        user,
        { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
        { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
        { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' }
      ];

      const defaultChannel: Channel = {
        name: 'Entwicklerteam',
        description: 'Dieser Channel ist für alles rund um #Entwicklerteam vorgesehen.',
        createdBy: 'Noah Braun',
        members: defaultMembers
      };

      this.channelService.addChannel(defaultChannel);
      this.channelService.setActiveChannel(defaultChannel);
      this.channelService.setMembersForChannel(defaultChannel.name, defaultMembers);
      this.channels = this.channelService.getChannels();
    }
  }

  toggleChannels() {
    this.showChannels = !this.showChannels;
  }

  toggleDMs() {
    this.showDMs = !this.showDMs;
  }

  openNewMessageDialog() {
    this.composeNewMessage.emit();
  }

selectChannelOnly(channel: Channel) {
  this.channelService.setActiveUser(null);
  this.channelService.setActiveChannel(channel);
  this.chatSelected.emit();
}


selectUser(user: CurrentUser) {
  this.channelService.setActiveUser(user);
  this.chatSelected.emit();
}


  updateUserInList(updatedUser: CurrentUser) {
    const existing = this.users.find((u) => u.id === updatedUser.id);
    if (existing) {
      existing.name = updatedUser.name;
      existing.avatar = updatedUser.avatar;
    } else {
      this.users.unshift(updatedUser);
    }
  }

  openChannelDialog() {
    const dialogRef = this.dialog.open(ChannelDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { name, description, members, createdBy } = result;

        const newChannel: Channel = {
          name,
          description,
          members,
          createdBy
        };

        this.channelService.addChannel(newChannel);
        this.channelService.setActiveChannel(newChannel);
        this.channelService.setMembersForChannel(name, members);
      }
    });
  }

  toggleSidebar() {
  this.isSidebarCollapsed = !this.isSidebarCollapsed;
}

@HostListener('window:resize')
onResize() {
  this.isMobile = window.innerWidth <= 900;
}
}

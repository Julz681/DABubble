import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';
import { ChannelInfoDialogComponent } from '../channel-info-dialog/channel-info-dialog.component';
import { NewMessageDialogComponent } from '../new-message-dialog/new-message-dialog.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

import { ChannelService, Channel } from '../services/channel.service';
import { CurrentUserService, CurrentUser } from '../services/current.user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentUser!: CurrentUser;
  users: CurrentUser[] = [];
  channels: Channel[] = [];

  showChannels = true;
  showDMs = true;

  constructor(
    private dialog: MatDialog,
    private channelService: ChannelService,
    private cdr: ChangeDetectorRef,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit() {
    this.currentUserService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.initDefaultChannel(user);
    });

    // Channels initialisieren
    this.channels = this.channelService.getChannels();

    // Dummy-Nutzerliste
    this.users = [
      { id: 'frederik', name: 'Frederik Beck', avatar: 'assets/Frederik Beck.png' },
      { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
      { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
      { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
      { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
      { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' }
    ];
  }

  initDefaultChannel(user: CurrentUser) {
    if (this.channelService.getChannels().length === 0) {
      const defaultChannel: Channel = {
        name: 'Entwicklerteam',
        description: 'Dieser Channel ist für alles rund um #Entwicklerteam vorgesehen.',
        createdBy: 'Noah Braun',
        members: [user]
      };
      this.channelService.addChannel(defaultChannel);
      this.channelService.setActiveChannel(defaultChannel);
      this.channels = this.channelService.getChannels();
    }
  }

  toggleChannels() {
    this.showChannels = !this.showChannels;
  }

  toggleDMs() {
    this.showDMs = !this.showDMs;
  }

  openChannelDialog() {
    const dialogRef = this.dialog.open(ChannelDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const newChannel: Channel = {
        name: result.name,
        description: result.description,
        createdBy: result.createdBy,
        members: result.members
      };

      this.channelService.addChannel(newChannel);
      this.channelService.setActiveChannel(newChannel);
      this.channels = this.channelService.getChannels();
    });
  }

  openChannelInfo(channel: Channel, event: MouseEvent) {
    event.stopPropagation();
    const isSystemChannel = channel.name === 'Entwicklerteam';

    const dialogRef = this.dialog.open(ChannelInfoDialogComponent, {
      width: '600px',
      panelClass: 'custom-dialog',
      data: {
        name: channel.name,
        description: channel.description,
        createdBy: channel.createdBy,
        isSystemChannel
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.leave && !isSystemChannel) {
        this.channelService.removeChannel(channel.name);
        this.channels = this.channelService.getChannels();

        const fallback = this.channels[0] || null;
        this.channelService.setActiveChannel(fallback);
        return;
      }

      if (result.updated && !isSystemChannel) {
        const updated: Channel = {
          ...channel,
          name: result.data.name,
          description: result.data.description,
          createdBy: result.data.createdBy
        };

        this.channelService.renameChannel(channel.name, updated.name);
        this.channelService.updateChannel(updated);
        this.channelService.setActiveChannel(updated);
        this.channels = this.channelService.getChannels();
      }
    });
  }

  leaveChannel(channel: Channel) {
    if (channel.name === 'Entwicklerteam') return;

    this.channelService.removeChannel(channel.name);
    this.channels = this.channelService.getChannels();

    const fallback = this.channels[0] || null;
    this.channelService.setActiveChannel(fallback);
  }

  selectChannelOnly(channel: Channel) {
    this.channelService.setActiveUser(null);
    this.channelService.setActiveChannel(channel);
  }

  selectUser(user: CurrentUser) {
    this.channelService.setActiveUser(user);
  }

  openNewMessageDialog() {
    const dialogRef = this.dialog.open(NewMessageDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(results => {
      if (!results || results.length === 0) return;

      for (const res of results) {
        const now = new Date();
        const message = {
          id: Date.now(),
          author: this.currentUser.name + ' (Du)',
          userId: this.currentUser.id,
          avatar: this.currentUser.avatar,
          content: res.message,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: now,
          reactions: [],
          isSelf: true
        };

        if (res.type === 'user') {
          const user = this.users.find(u => u.id === res.id);
          if (user) {
            this.selectUser(user);
            this.channelService.addMessage(user.id, message, true);
          }
        } else if (res.type === 'channel') {
          const channel = this.channels.find(c => c.name === res.name);
          if (channel) {
            this.selectChannelOnly(channel);
            this.channelService.addMessage(res.name, message, false);
          }
        }
      }
    });
  }

  openUserProfile(user: CurrentUser) {
    const dialogRef = this.dialog.open(UserProfileComponent, {
      width: '400px',
      data: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        email: `${user.id}@beispiel.com`,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.startChatWith) {
        this.channelService.setActiveUser({
          id: result.startChatWith.id,
          name: result.startChatWith.name,
          avatar: result.startChatWith.avatar
        });
      }
    });
  }
}

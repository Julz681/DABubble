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
import {
  CurrentUserService,
  CurrentUser,
} from '../services/current.user.service';

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
  styleUrls: ['./sidebar.component.scss'],
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
  this.currentUserService.currentUser$.subscribe((user) => {
    this.currentUser = user;
    this.updateUserInList(user);
    this.initDefaultChannel(user);

    // Dummy-User initial anhängen (nur wenn noch nicht vorhanden)
    const dummyUsers: CurrentUser[] = [
      { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
      { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
      { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
      { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
      { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' },
    ];

    for (const dummy of dummyUsers) {
      if (!this.users.find((u) => u.id === dummy.id)) {
        this.users.push(dummy);
      }
    }

    // Optional: Alphabetisch sortieren
    this.users.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Channels initialisieren
  this.channelService.channels$.subscribe((channels) => {
    this.channels = channels;
  });
}


  initDefaultChannel(user: CurrentUser) {
    if (this.channelService.getChannels().length === 0) {
      const defaultMembers = [
        user,
        {
          id: 'sofia',
          name: 'Sofia Müller',
          avatar: 'assets/Sofia Müller.png',
        },
        { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
        {
          id: 'elias',
          name: 'Elias Neumann',
          avatar: 'assets/Elias Neumann.png',
        },
      ];

      const defaultChannel: Channel = {
        name: 'Entwicklerteam',
        description:
          'Dieser Channel ist für alles rund um #Entwicklerteam vorgesehen.',
        createdBy: 'Noah Braun',
        members: defaultMembers,
      };

      this.channelService.addChannel(defaultChannel);
      this.channelService.setActiveChannel(defaultChannel);

      this.channelService.setMembersForChannel(
        defaultChannel.name,
        defaultMembers
      );

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
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const newChannel: Channel = {
        name: result.name,
        description: result.description,
        createdBy: result.createdBy,
        members: result.members,
      };

      this.channelService.addChannel(newChannel);
      this.channelService.setActiveChannel(newChannel);
      this.channels = this.channelService.getChannels();
    });
  }

  openChannelInfo(channel: Channel, event: MouseEvent) {
    console.log('[DEBUG] openChannelInfo aufgerufen für:', channel.name);

    event.stopPropagation();

    const isSystemChannel = channel.name === 'Entwicklerteam';

    const dialogRef = this.dialog.open(ChannelInfoDialogComponent, {
      width: '600px',
      panelClass: 'custom-dialog',
      data: {
        name: channel.name,
        description: channel.description,
        createdBy: channel.createdBy,
        isSystemChannel,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('[DEBUG] afterClosed result:', result);

      if (!result) return;

      if (result.leave) {
        console.log(
          '[DEBUG] result.leave === true – versuche Channel zu entfernen:',
          channel.name
        );

        const wasActive =
          this.channelService.getCurrentChannel()?.name === channel.name;

        this.channelService.removeChannel(channel.name);
        this.channels = this.channelService.getChannels();

        if (wasActive) {
          console.log('[DEBUG] Entfernte Channel war aktiv – zurücksetzen');
          this.channelService.setActiveUser(null);
          this.channelService.setActiveChannel({
            name: '',
            description: '',
            createdBy: '',
            members: [],
          });
          this.channelService.clearMessages();
        }

        const fallback = this.channels.length > 0 ? this.channels[0] : null;
        if (fallback) {
          console.log('[DEBUG] Fallback-Channel wird gesetzt:', fallback.name);
          this.channelService.setActiveChannel(fallback);
        }

        return;
      }

      if (result.updated && !isSystemChannel) {
        console.log(
          '[DEBUG] result.updated === true – aktualisiere Channel:',
          channel.name
        );
        const updated: Channel = {
          ...channel,
          name: result.data.name,
          description: result.data.description,
          createdBy: result.data.createdBy,
        };

        this.channelService.renameChannel(channel.name, updated.name);
        this.channelService.updateChannel(updated);

        const isCurrentlyActive =
          this.channelService.getCurrentChannel()?.name === channel.name;
        if (isCurrentlyActive) {
          this.channelService.setActiveChannel(updated);
        }

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
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((results) => {
      if (!results || results.length === 0) return;

      for (const res of results) {
        const now = new Date();
        const message = {
          id: Date.now(),
          author: this.currentUser.name + ' (Du)',
          userId: this.currentUser.id,
          avatar: this.currentUser.avatar,
          content: res.message,
          time: now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          createdAt: now,
          reactions: [],
          isSelf: true,
        };

        if (res.type === 'user') {
          const user = this.users.find((u) => u.id === res.id);
          if (user) {
            this.selectUser(user);
            this.channelService.addMessage(user.id, message, true);
          }
        } else if (res.type === 'channel') {
          const channel = this.channels.find((c) => c.name === res.name);
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.startChatWith) {
        this.channelService.setActiveUser({
          id: result.startChatWith.id,
          name: result.startChatWith.name,
          avatar: result.startChatWith.avatar,
        });
      }
    });
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

}

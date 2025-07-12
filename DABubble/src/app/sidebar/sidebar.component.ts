import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';
import { ChannelService, Channel } from '../services/channel.service'; // 👈 Channel importiert!
import { NewMessageDialogComponent } from '../new-message-dialog/new-message-dialog.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { ChangeDetectorRef } from '@angular/core';
import { CurrentUserService, CurrentUser } from '../services/current.user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentUser!: CurrentUser;

  users: CurrentUser[] = [
    { id: 'frederik', name: '', avatar: 'assets/Frederik Beck.png' },
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' }
  ];

  // 👇 Jetzt typisiert als Channel, damit description & createdBy gültig sind
  channels: Channel[] = [
    {
      name: 'Entwicklerteam',
      members: [],
      description: 'Standard-Channel',
      createdBy: 'System'
    }
  ];

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

      const me = this.users.find(u => u.id === user.id);
      if (me) {
        me.name = user.name;
        me.avatar = user.avatar;
      } else {
        this.users.unshift({ ...user });
      }

      for (const channel of this.channels) {
        const member = channel.members?.find(m => m.id === user.id);
        if (member) {
          member.name = user.name;
          member.avatar = user.avatar;
        } else {
          channel.members?.unshift({ ...user });
        }
      }

      this.cdr.detectChanges();
    });
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newChannel: Channel = {
          name: result.name,
          description: result.description,
          createdBy: result.createdBy,
          members: result.members,
        };

        this.channels.push(newChannel);
        this.channelService.setMembersForChannel(result.name, result.members);
        this.channelService.setDescription(result.name, result.description);
        this.channelService.setCreatedBy(result.name, result.createdBy);

        this.selectChannel(newChannel);
      }
    });
  }

  // 👇 Typ ist jetzt korrekt als Channel
  selectChannel(channel: Channel) {
    const members = this.channelService.getMembersForChannel(channel.name);
    this.channelService.setActiveUser(null);
    this.channelService.setActiveChannel({
      name: channel.name,
      members,
      description: channel.description,
      createdBy: channel.createdBy
    });
  }

  selectUser(user: CurrentUser) {
    this.channelService.setActiveUser(user);
  }

  openNewMessageDialog() {
    const dialogRef = this.dialog.open(NewMessageDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog'
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
            this.selectChannel(channel);
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

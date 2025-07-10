import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';
import { ChannelService } from '../services/channel.service';

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
export class SidebarComponent {
  users = [
    { id: 'frederik', name: 'Frederik Beck (Du)', avatar: 'assets/Frederik Beck.png' },
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' }
  ];

  showChannels = true;
  showDMs = true;

  channels = [
    {
      name: 'Entwicklerteam',
      members: [
        { id: 'frederik', name: 'Frederik Beck (Du)', avatar: 'assets/Frederik Beck.png' },
        { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
        { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
        { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' }
      ]
    }
  ];

  constructor(
    private dialog: MatDialog,
    private channelService: ChannelService
  ) {}

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
      if (result) {
        // Channel speichern
        this.channels.push({ name: result.name, members: result.members });

        // Mitglieder im Service speichern
        this.channelService.setMembersForChannel(result.name, result.members);

        // Channel aktiv setzen
        this.selectChannel({ name: result.name, members: result.members });
      }
    });
  }

  selectChannel(channel: { name: string; members?: any[] }) {
    const members = this.channelService.getMembersForChannel(channel.name);
    this.channelService.setActiveChannel({ name: channel.name, members });
  }
}

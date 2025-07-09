import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChannelDialogComponent } from '../channel-dialog/channel-dialog.component';

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
    { name: 'Frederik Beck (Du)', avatar: 'assets/Frederik Beck.png' },
    { name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    { name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' },
  ];

  showChannels = true;
  showDMs = true;

  constructor(private dialog: MatDialog) {}

toggleChannels() {
  this.showChannels = !this.showChannels;
}

  toggleDMs() {
    this.showDMs = !this.showDMs;
  }

  openChannelDialog() {
    this.dialog.open(ChannelDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog'
    });
  }
}


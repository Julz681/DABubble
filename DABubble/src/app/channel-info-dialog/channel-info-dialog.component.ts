import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-channel-info-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './channel-info-dialog.component.html',
  styleUrls: ['./channel-info-dialog.component.scss'],
})
export class ChannelInfoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ChannelInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { name: string; description?: string; createdBy?: string }
  ) {}

get isSystemChannel(): boolean {
  return this.data.name === 'Entwicklerteam';
}

get creator(): string {
  return this.data.createdBy?.trim() || 'Unbekannt';
}

get description(): string {
  return this.data.description?.trim() || 'Keine Beschreibung vorhanden.';
}


}

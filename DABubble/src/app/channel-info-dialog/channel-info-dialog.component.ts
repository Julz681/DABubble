import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-channel-info-dialog',
  standalone: true,
  templateUrl: './channel-info-dialog.component.html',
  styleUrls: ['./channel-info-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class ChannelInfoDialogComponent {
  editMode = false;
  name: string;
  description: string;
  createdBy: string;
  isSystemChannel: boolean;

  constructor(
    public dialogRef: MatDialogRef<ChannelInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isSystemChannel = data.name === 'Entwicklerteam';

    this.name = data.name;
    this.description = this.isSystemChannel
      ? 'Dieser Channel ist für alles rund um #Entwicklerteam vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.'
      : data.description || 'Keine Beschreibung';

    this.createdBy = this.isSystemChannel ? 'Noah Braun' : data.createdBy || 'Unbekannt';
  }

  saveChanges() {
    if (this.isSystemChannel) return;
    this.dialogRef.close({
      updated: true,
      data: {
        name: this.name,
        description: this.description,
        createdBy: this.createdBy
      }
    });
  }

leaveChannel() {
  this.dialogRef.close({ leave: true });
}


  cancel() {
    this.dialogRef.close();
  }
}

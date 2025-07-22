import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AddMembersDialogComponent } from '../app-add-members-dialog/app-add-members-dialog.component';



import { ChannelService, ChatUser } from '../services/channel.service';
import { CurrentUserService, CurrentUser } from '../services/current.user.service';


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
    MatIconModule,
    MatTooltipModule
  ]
})
export class ChannelInfoDialogComponent {
  editMode = false;
  name: string;
  description: string;
  createdBy: string;
  isSystemChannel: boolean;


  members: ChatUser[] = [];
  currentUser: CurrentUser | null = null;

constructor(
  public dialogRef: MatDialogRef<ChannelInfoDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private channelService: ChannelService,
  private currentUserService: CurrentUserService,
  private dialog: MatDialog
) {
  this.isSystemChannel = this.data.isSystemChannel === true;
  this.name = this.data.name;
  this.description = this.data.description || 'Keine Beschreibung';

  // ✅ Erst den aktuellen Nutzer laden
  this.currentUser = this.currentUserService.getCurrentUser();

  // ✅ Danach prüfen, ob Entwicklerchannel
  const isDevChannel = this.data.name?.toLowerCase()?.includes('entwickler');

this.createdBy = isDevChannel
  ? 'Noah Braun'
  : this.currentUser?.name || 'Unbekannt';
  // ✅ Mitglieder initialisieren
  this.members = this.channelService.getMembersForChannel(this.name) || [];

  const alreadyInList = this.members.some(
    (u) => u.name === this.currentUser?.name
  );

  if (this.currentUser && !alreadyInList) {
    this.members.unshift({
      id: this.currentUser.id,
      name: this.currentUser.name,
      avatar: this.currentUser.avatar
    });
  }
}


  saveChanges() {
    if (this.isSystemChannel) {
      console.warn('[WARN] Änderungen am Systemchannel sind nicht erlaubt.');
      return;
    }

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
    console.log('[DEBUG] leaveChannel() im Dialog wurde aufgerufen');
    this.dialogRef.close({ leave: true });
  }

  cancel() {
    this.dialogRef.close();
  }


  isUserOnline(user: ChatUser): boolean {
  return this.currentUserService.getAllUsers().some(
    (u) => u.id === user.id && u.isOnline
  );
}

openMemberDialog() {
  console.debug('[DEBUG] openMemberDialog() wurde aufgerufen');

  const dialogRef = this.dialog.open(AddMembersDialogComponent, {

  panelClass: 'bottom-dialog',
  width: '100vw',
  autoFocus: false,
  data: { existingMembers: this.members.map(u => u.name) }
});

  dialogRef.afterClosed().subscribe((newMembers: ChatUser[]) => {
    if (newMembers && newMembers.length > 0) {
      const updatedMembers = [...this.members, ...newMembers];

      this.members = updatedMembers;

      // Optional: In Service speichern
      this.channelService.setMembersForChannel(this.name, updatedMembers);

      console.debug('[DEBUG] Mitglieder aktualisiert:', updatedMembers);
    }
  });
}


}

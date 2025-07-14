import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../services/channel.service';
import { ThreadPanelService } from '../services/thread.panel.service';
import { ChannelMembersDialogComponent } from '../channel-members-dialog/channel-members-dialog.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FileService } from '../services/file.service';


import {
  CurrentUserService,
  CurrentUser,
} from '../services/current.user.service';
import { ChannelInfoDialogComponent } from '../channel-info-dialog/channel-info-dialog.component';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

interface ChatMessage {
  id: number;
  author: string;
  userId: string;
  time: string;
  content: string;
  avatar: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
  isSelf?: boolean;
  replies?: ChatMessage[];
  replyToId?: number;
  createdAt: Date;
  edited?: boolean;
  url?: string;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @Input() threadToggle?: () => void;

  newMessage = '';
  showEmojis = false;
  showUsers = false;
  showFullUserList = false;
  hoveredMessage: ChatMessage | null = null;
  replyingTo: ChatMessage | null = null;
  editingMessageId: number | null = null;
  editedMessageContent: string = '';
  mentionMode: 'user' | 'channel' | null = null;
  filteredUsers: ChatUser[] = [];
  filteredChannels: string[] = [];
  activeChannelDescription = '';
  activeChannelCreatedBy = '';
  emojiPopoverMessage: ChatMessage | null = null;


  activeUser: ChatUser | null = null;
  activeChannelName = '';

  currentChannelMessages: ChatMessage[] = [];
  currentChannelUsers: ChatUser[] = [];
  groupedMessages: { dateLabel: string; messages: ChatMessage[] }[] = [];

  allUsers: ChatUser[] = [
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    {
      id: 'steffen',
      name: 'Steffen Hoffmann',
      avatar: 'assets/Steffen Hoffmann.png',
    },
  ];

  currentUser!: CurrentUser;

  emojis = ['😀', '😄', '🚀', '❤️', '👍', '✅', '🎯', '😂'];

  constructor(
    private channelService: ChannelService,
    private dialog: MatDialog,
    private threadPanelService: ThreadPanelService,
    private currentUserService: CurrentUserService,
    private fileService: FileService, 
  ) {}

  ngOnInit(): void {
    // 1. Aktuellen Benutzer abonnieren
    this.currentUserService.currentUser$.subscribe((user) => {
      this.currentUser = user;

      // 2. User zur Liste hinzufügen oder aktualisieren
      const existing = this.allUsers.find((u) => u.id === user.id);
      if (existing) {
        existing.name = user.name;
        existing.avatar = user.avatar;
      } else {
        this.allUsers.unshift(user);
      }

      // 3. Standard-Channel festlegen
      const defaultChannel = 'Entwicklerteam';
      this.activeChannelName = defaultChannel;

      // 4. Mitglieder setzen
      this.channelService.setMembersForChannel(defaultChannel, [
        this.currentUser,
        this.allUsers.find((u) => u.id === 'sofia')!,
        this.allUsers.find((u) => u.id === 'noah')!,
        this.allUsers.find((u) => u.id === 'elise')!,
      ]);

      // 5. Beispielhafte Nachrichten
      this.channelService.channelMessages[defaultChannel] = [
        {
          id: 1,
          author: 'Noah Braun',
          userId: 'noah',
          time: '14:25 Uhr',
          content: 'Welche Version ist aktuell von Angular?',
          avatar: 'assets/Noah Braun.png',
          reactions: [],
          isSelf: false,
          replies: [
            {
              id: 2,
              author: 'Sofia Müller',
              userId: 'sofia',
              time: '14:26 Uhr',
              content: 'Ich glaube 17.1, oder?',
              avatar: 'assets/Sofia Müller.png',
              reactions: [],
              isSelf: false,
              createdAt: new Date(),
            },
            {
              id: 3,
              author: this.currentUser.name,
              userId: this.currentUser.id,
              time: '14:27 Uhr',
              content: 'Die aktuelle Version ist 17.2.1.',
              avatar: this.currentUser.avatar,
              reactions: [],
              isSelf: true,
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      ];

      // 6. Channel aktivieren
      this.channelService.setActiveChannel({
        name: defaultChannel,
        members: this.channelService.getMembersForChannel(defaultChannel),
      });
    });

    // 7. Direktnachrichten-Aktivierung
    this.channelService.activeUser$.subscribe((user) => {
      this.activeUser = user;

      const currentChannel = this.channelService.getCurrentChannel();
      const isValidChannel =
        currentChannel &&
        this.channelService
          .getChannels()
          .some((c) => c.name === currentChannel.name);

      this.activeChannelName = user
        ? user.name
        : isValidChannel
        ? currentChannel!.name
        : '';

      this.currentChannelUsers = user
        ? [this.currentUser, user]
        : isValidChannel
        ? this.channelService.getMembersForChannel(currentChannel!.name)
        : [];
    });

    // 8. Channelwechsel
    this.channelService.activeChannel$.subscribe((channel) => {
      if (channel) {
        this.activeUser = null;
        this.activeChannelName = channel.name;
        this.activeChannelDescription = channel.description || '';
        this.activeChannelCreatedBy = channel.createdBy || '';
        this.currentChannelUsers = this.channelService.getMembersForChannel(
          channel.name
        );
      } else {
        this.activeUser = null;
        this.activeChannelName = '';
        this.activeChannelDescription = '';
        this.activeChannelCreatedBy = '';
        this.currentChannelUsers = [];
        this.currentChannelMessages = [];
        this.groupedMessages = [];
        this.newMessage = ''; // Leere Eingabezeile
      }
    });

    // 9. Nachrichten-Stream
    this.channelService.messages$.subscribe((messages) => {
      this.currentChannelMessages = messages;
      this.groupMessagesByDate();
    });

    // 10. Thread-Aktualisierung
    this.threadPanelService.threadRootMessage$.subscribe((updatedRoot) => {
      if (!updatedRoot) return;

      const target = this.activeUser?.id ?? this.activeChannelName;
      const messages = this.activeUser
        ? this.channelService.directMessages[target] || []
        : this.channelService.channelMessages[target] || [];

      const index = messages.findIndex((msg) => msg.id === updatedRoot.id);
      if (index !== -1) {
        messages[index] = updatedRoot;

        if (this.activeUser) {
          this.channelService.directMessages[target] = messages;
        } else {
          this.channelService.channelMessages[target] = messages;
        }

        this.channelService.updateMessagesForActiveTarget();
      }
    });

    // 11. Direktnachricht aus Profil starten
    window.addEventListener('startDirectChat', this.startDirectChatHandler);
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content) return;

    const now = new Date();
    const isDirectMessage = !!this.activeUser;

    const message: ChatMessage = {
      id: Date.now(),
      author: this.currentUser.name,
      userId: this.currentUser.id,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
      avatar: this.currentUser.avatar,
      reactions: [],
      isSelf: true,
      replies: [],
      createdAt: now,
    };

    if (this.replyingTo) {
      if (!this.replyingTo.replies) this.replyingTo.replies = [];
      this.replyingTo.replies.push(message);
      this.channelService.updateMessagesForActiveTarget();
    } else {
      const targetId = isDirectMessage
        ? this.activeUser!.id
        : this.activeChannelName;
      this.channelService.addMessage(targetId, message, isDirectMessage);
    }

    this.newMessage = '';
    this.replyingTo = null;
    this.showEmojis = false;
    this.showUsers = false;
  }

  groupMessagesByDate(): void {
    const groups: { [key: string]: ChatMessage[] } = {};
    for (const message of this.currentChannelMessages) {
      const key = this.getDateKey(message.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(message);
    }
    this.groupedMessages = Object.entries(groups).map(([key, messages]) => ({
      dateLabel: this.formatDateLabel(key),
      messages,
    }));
  }

  getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateLabel(dateKey: string): string {
    const today = new Date();
    const date = new Date(dateKey);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Heute';
    if (date.toDateString() === yesterday.toDateString()) return 'Gestern';

    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  toggleEmojiPicker() {
    this.showEmojis = !this.showEmojis;
    this.showUsers = false;
  }

toggleUserList() {
  const lastChar = this.newMessage.slice(-1);
  if (lastChar === '@') {
    this.mentionMode = 'user';
    this.filteredUsers = this.activeUser
      ? [this.currentUser, this.activeUser]
      : [...this.currentChannelUsers];
    this.showUsers = true;
    this.showEmojis = false;
  } else {
    this.mentionMode = 'user'; 
    this.filteredUsers = this.activeUser
      ? [this.currentUser, this.activeUser]
      : [...this.currentChannelUsers];
    this.showUsers = true;
    this.showEmojis = false;
  }
}


  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojis = false;
  }

replyTo(message: ChatMessage): void {
  const mention = `@${this.getUserNameFromId(message.userId)} `;

  // 👇 Das ist die entscheidende Änderung:
  this.threadPanelService.openThread(message, mention);

  if (this.threadToggle) {
    this.threadToggle();
  }

  setTimeout(() => {
    const input = this.chatInputRef?.nativeElement;
    if (input) {
      input.focus();
      const pos = this.newMessage.length;
      input.setSelectionRange(pos, pos);
    }
  }, 0);
}






  toggleReaction(message: ChatMessage, emoji: string) {
    if (!message.reactions) message.reactions = [];
    const reaction = message.reactions.find((r) => r.emoji === emoji);
    const userId = this.currentUser.id;
    if (reaction) {
      const idx = reaction.users.indexOf(userId);
      if (idx !== -1) {
        reaction.users.splice(idx, 1);
        reaction.count--;
        if (reaction.count === 0) {
          message.reactions = message.reactions.filter((r) => r.count > 0);
        }
      } else {
        reaction.users.push(userId);
        reaction.count++;
      }
    } else {
      message.reactions.push({ emoji, count: 1, users: [userId] });
    }
  }

  getLastReplyTime(message: ChatMessage): string {
    return message.replies?.[message.replies.length - 1]?.time ?? '';
  }

  getUserNamesFromIds(ids: string[]): string[] {
    return this.currentChannelUsers
      .filter((u) => ids.includes(u.id))
      .map((u) => u.name);
  }
  getUserNameFromId(userId: string): string {
  if (userId === this.currentUser.id) {
    return this.currentUser.name;
  }

  const user =
    this.allUsers.find(u => u.id === userId) ||
    this.currentChannelUsers.find(u => u.id === userId);

  return user?.name || 'Unbekannt';
}


  toggleUserDropdown() {
    setTimeout(() => (this.showFullUserList = !this.showFullUserList));
  }

  @ViewChild('userDropdownRef') userDropdownRef!: ElementRef;
  @ViewChild('mentionPickerRef') mentionPickerRef!: ElementRef;
  @ViewChild('chatInput') chatInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;




@HostListener('document:click', ['$event'])
handleGlobalClick(event: MouseEvent): void {
  const clickedTarget = event.target as HTMLElement;

  // === USER DROPDOWN ===
  const clickedInsideUserDropdown =
    this.userDropdownRef?.nativeElement.contains(clickedTarget);

  if (!clickedInsideUserDropdown && this.showFullUserList) {
    this.showFullUserList = false;
  }

  // === MENTION PICKER ===
  const clickedInsideMention =
    this.mentionPickerRef?.nativeElement.contains(clickedTarget);

  const clickedInput = clickedTarget.closest('input');
  const clickedMentionButton = clickedTarget.closest('button')?.innerText === '@';

  if (!clickedInsideMention && !clickedInput && !clickedMentionButton && this.showUsers) {
    this.showUsers = false;
    this.mentionMode = null;
  }

  // === EMOJI POPOVER ===
  const isInPopover = !!clickedTarget.closest('.emoji-picker.popover');
  const isEmojiPlus = !!clickedTarget.closest('.emoji-plus');

  if (!isInPopover && !isEmojiPlus) {
    this.emojiPopoverMessage = null;
  }
}




  openAddUserDialog() {
    const dialogRef = this.dialog.open(ChannelMembersDialogComponent, {
      width: '500px',
      data: {
        mode: 'add',
        channelName: this.activeChannelName,
        existingMembers: this.currentChannelUsers.map((u) => u.name),
      },
    });

    dialogRef.afterClosed().subscribe((newUsers: ChatUser[]) => {
      if (newUsers?.length) {
        const filtered = newUsers.filter(
          (u) => !this.currentChannelUsers.find((m) => m.id === u.id)
        );
        this.currentChannelUsers = [...this.currentChannelUsers, ...filtered];
        this.channelService.setMembersForChannel(
          this.activeChannelName,
          this.currentChannelUsers
        );
      }
    });
  }

  startEditing(message: ChatMessage) {
    this.editingMessageId = message.id;
    this.editedMessageContent = message.content;
  }

  cancelEdit() {
    this.editingMessageId = null;
    this.editedMessageContent = '';
  }

  saveEdit(message: ChatMessage): void {
    const trimmed = this.editedMessageContent.trim();
    if (trimmed) {
      message.content = trimmed;
      message.edited = true;
    }
    this.cancelEdit();
  }

onMessageInput() {
  const match = this.newMessage.match(/@([^@\s]*)$/);
  if (match) {
    const term = match[1].toLowerCase();
    this.mentionMode = 'user';
    const availableUsers = this.activeUser
      ? [this.currentUser, this.activeUser]
      : this.currentChannelUsers;

    this.filteredUsers = availableUsers.filter((user) =>
      user.name.toLowerCase().includes(term)
    );

    this.showUsers = this.filteredUsers.length > 0;
  } else {
    this.showUsers = false;
    this.mentionMode = null;
  }
}


mentionUser(user: ChatUser) {
  const atPattern = /@[^@\s]*$/;
  const insertText = `@${user.name}`;

  if (atPattern.test(this.newMessage)) {
    this.newMessage = this.newMessage.replace(atPattern, insertText + ' ');
  } else {
    this.newMessage += insertText + ' ';
  }

  this.showUsers = false;
  this.mentionMode = null;

  // Optional: Cursor an das Ende setzen
  setTimeout(() => {
    const input = document.querySelector('input');
    if (input instanceof HTMLInputElement) {
      input.focus();
      const pos = this.newMessage.length;
      input.setSelectionRange(pos, pos);
    }
  }, 0);
}


  mentionChannel(name: string) {
    this.newMessage = this.newMessage.replace(/#\w*$/, `#${name} `);
    this.showUsers = false;
    this.mentionMode = null;
  }

  get isSelfChat(): boolean {
    return this.activeUser?.id === this.currentUser?.id;
  }

  openUserProfile(message: ChatMessage) {
    // Öffne kein Profil vom aktuellen Benutzer selbst
    if (message.userId === this.currentUser.id) return;

    const dialogRef = this.dialog.open(UserProfileComponent, {
      width: '400px',
      data: {
        id: message.userId,
        name: message.author,
        avatar: message.avatar,
        email: `${message.userId}@beispiel.com`,
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

  openUserProfileFromUser(user: ChatUser) {
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

  startDirectChatHandler = (e: any) => {
    const user = e.detail;
    this.channelService.setActiveUser(user);
  };

  ngOnDestroy(): void {
    window.removeEventListener('startDirectChat', this.startDirectChatHandler);
  }

  getDisplayName(user: ChatUser): string {
    return user.id === this.currentUser.id ? `${user.name}` : user.name;
  }

  getDisplayNameFromString(userId: string, name: string): string {
    return userId === this.currentUser.id ? `${name} (Du)` : name;
  }

openChannelInfo() {
  const channel = this.channelService.getCurrentChannel();
  if (!channel) return;

  const description = this.channelService.getDescription(channel.name) || 'Keine Beschreibung';
  const createdBy = this.channelService.getCreatedBy(channel.name) || 'Unbekannt';

  const isSystemChannel = channel.name === 'Entwicklerteam';

  const dialogRef = this.dialog.open(ChannelInfoDialogComponent, {
    width: '500px',
    data: {
      name: channel.name,
      description,
      createdBy,
      isSystemChannel
    }
  });

  dialogRef.afterClosed().subscribe((result) => {
    console.log('[DEBUG] Dialog geschlossen mit:', result);
    if (!result) return;


    if (result.leave) {
      console.log('[DEBUG] Channel verlassen wurde gewählt:', channel.name);

      const wasActive = this.channelService.getCurrentChannel()?.name === channel.name;

      this.channelService.removeChannel(channel.name);

      if (wasActive) {
        this.channelService.setActiveUser(null);
        this.channelService.setActiveChannel(null);
      }

      const remainingChannels = this.channelService.getChannels();

      if (remainingChannels.length > 0) {
        console.log('[DEBUG] Fallback zu anderem Channel:', remainingChannels[0].name);
        this.channelService.setActiveChannel(remainingChannels[0]);
      } else {

        const fallbackUsers = [
          { id: 'frederik', name: 'Frederik Beck', avatar: 'assets/Frederik Beck.png' },
          { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
          { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
          { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
          { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
          { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' }
        ];

        if (fallbackUsers.length > 0) {
          console.log('[DEBUG] Keine Channels mehr – Fallback zur Direktnachricht mit:', fallbackUsers[0].name);
          this.channelService.setActiveUser(fallbackUsers[0]);
        } else {
          console.log('[DEBUG] Kein Channel, keine User – leere Ansicht');
          this.channelService.setActiveUser(null);
          this.channelService.setActiveChannel(null);
          this.channelService.clearMessages?.(); 
        }
      }

      return;
    }

    // === CHANNEL AKTUALISIEREN ===
if (result.updated && !isSystemChannel) {
  console.log('[DEBUG] Channel wurde aktualisiert:', result.data);

  this.channelService.renameChannel(channel.name, result.data.name);
  this.channelService.setDescription(result.data.name, result.data.description);
  this.channelService.setCreatedBy(result.data.name, result.data.createdBy);

  const updatedChannel = {
    ...channel,
    name: result.data.name,
    description: result.data.description,
    createdBy: result.data.createdBy
  };

  this.channelService.setActiveChannel(updatedChannel);
} else if (result.updated && isSystemChannel) {
  console.warn('[WARN] Systemchannel darf nicht bearbeitet werden:', channel.name);
}

  });
}

toggleEmojiPopover(message: ChatMessage) {
  this.emojiPopoverMessage =
    this.emojiPopoverMessage === message ? null : message;
}

addReaction(message: ChatMessage, emoji: string) {
  this.toggleReaction(message, emoji);
  this.emojiPopoverMessage = null; 
}

onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const path = `chat-files/${Date.now()}_${file.name}`;
  const { percent$, url$ } = this.fileService.uploadFile(file, path);

  percent$.subscribe(pct => console.log(`Hochladen: ${pct.toFixed(0)}%`));
  url$.subscribe(url => {
    const msg = {
      id: Date.now(),
      author: this.currentUser.name,
      userId: this.currentUser.id,
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      content: `Datei: ${file.name}`,
url, 

      avatar: this.currentUser.avatar,
      isSelf: true,
      createdAt: new Date()
    };
    // Füge Nachricht hinzu
    const target = this.activeUser ? this.activeUser.id : this.activeChannelName;
    this.channelService.addMessage(target, msg, !!this.activeUser);
  });
}

}
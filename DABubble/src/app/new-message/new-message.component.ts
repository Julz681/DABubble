import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import {
  CommonModule
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  Router,
  RouterModule
} from '@angular/router';
import {
  debounceTime
} from 'rxjs/operators';
import {
  CurrentUserService,
  CurrentUser
} from '../services/current.user.service';
import {
  ChannelService
} from '../services/channel.service';

@Component({
  selector: 'app-new-message',
  standalone: true,
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class NewMessageComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('textArea') textAreaRef!: ElementRef<HTMLTextAreaElement>;

  recipientInput = new FormControl('');
  message = '';
  selectedRecipients: string[] = [];
  allUsers: CurrentUser[] = [];
  filteredRecipients: CurrentUser[] = [];
  showRecipientSuggestions = false;

  showMentionSuggestions = false;
  mentionSuggestions: CurrentUser[] = [];
  selectedFiles: File[] = [];

  constructor(
    private currentUserService: CurrentUserService,
    private channelService: ChannelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.allUsers = this.currentUserService.getAllUsers();

    this.recipientInput.valueChanges
      .pipe(debounceTime(200))
      .subscribe(value => {
        const input = value ?? '';
        if (input.startsWith('@')) {
          const query = input.slice(1).toLowerCase();
          this.filteredRecipients = this.allUsers.filter(user =>
            user.name.toLowerCase().includes(query)
          );
          this.showRecipientSuggestions = true;
        } else {
          this.showRecipientSuggestions = false;
        }
      });
  }

  selectRecipient(user: CurrentUser) {
    const formatted = `@${user.id}`;
    if (!this.selectedRecipients.includes(formatted)) {
      this.selectedRecipients.push(formatted);
    }
    this.recipientInput.setValue('');
    this.showRecipientSuggestions = false;
  }

  removeRecipient(i: number) {
    this.selectedRecipients.splice(i, 1);
  }

  onMessageInput() {
    const cursor = this.textAreaRef.nativeElement.selectionStart;
    const textUntilCursor = this.message.slice(0, cursor);
    const match = textUntilCursor.match(/(^|\s)@(\w*)$/);

    if (match) {
      const search = match[2].toLowerCase();
      this.mentionSuggestions = this.allUsers.filter(user =>
        user.name.toLowerCase().includes(search)
      );
      this.showMentionSuggestions = true;
    } else {
      this.showMentionSuggestions = false;
    }
  }

  insertMention(user: CurrentUser) {
    const textarea = this.textAreaRef.nativeElement;
    const cursor = textarea.selectionStart;
    const textBefore = this.message.slice(0, cursor);
    const textAfter = this.message.slice(cursor);

    const newTextBefore = textBefore.replace(/@(\w*)$/, `@${user.name}`);
    this.message = newTextBefore + textAfter;

    this.showMentionSuggestions = false;

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = newTextBefore.length;
    });
  }

  toggleEmoji() {
    this.message += '😊';
  }

  onFileSelected(event: any) {
    const files: File[] = Array.from(event.target.files);
    this.selectedFiles.push(...files);
  }

  sendMessage() {
    const content = this.message.trim();
    if (!content || this.selectedRecipients.length === 0) return;

    const firstRecipient = this.selectedRecipients[0];

    const message = {
      sender: this.currentUserService.getCurrentUser(),
      content,
      timestamp: new Date(),
      attachments: this.selectedFiles
    };

    if (firstRecipient.startsWith('#')) {
      const channelName = firstRecipient.slice(1);
      this.channelService.addMessage(channelName, message, false);
      this.channelService.setActiveChannelByName(channelName);
      this.router.navigate([`/channels/${channelName}`]);
    } else if (firstRecipient.startsWith('@')) {
      const userId = firstRecipient.slice(1);
      this.channelService.addMessage(userId, message, true);
      this.channelService.setActiveUserById(userId);
      this.router.navigate([`/dm/${userId}`]);
    }
  }
}

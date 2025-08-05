import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChannelService } from './channel.service';

export interface ChatMessage {
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
}

@Injectable({ providedIn: 'root' })
export class ThreadPanelService {
  private _threadRootMessage = new BehaviorSubject<ChatMessage | null>(null);
  private _threadReplies = new BehaviorSubject<ChatMessage[]>([]);
  private _initialReplyText = new BehaviorSubject<string>('');

  threadRootMessage$ = this._threadRootMessage.asObservable();
  threadReplies$ = this._threadReplies.asObservable();
  initialReplyText$ = this._initialReplyText.asObservable();

  public isThreadView = false;

  constructor(private channelService: ChannelService) {}

  openThread(rootMessage: ChatMessage, initialReply: string = ''): void {
    this._threadRootMessage.next(rootMessage);
    this._threadReplies.next(rootMessage.replies || []);
    this._initialReplyText.next(initialReply);
    this.isThreadView = true;
  }

  addReply(reply: ChatMessage): void {
    const updatedReplies = [...this._threadReplies.value, reply];
    this._threadReplies.next(updatedReplies);

    const root = this._threadRootMessage.value;
    if (root) {
      root.replies = updatedReplies;
      this._threadRootMessage.next({ ...root });

      const isDirect = !this.channelService.getCurrentChannel();
      const target = isDirect
        ? this.channelService.getCurrentUser()?.id
        : this.channelService.getCurrentChannel()?.name;

      if (!target) return;

      const store = isDirect
        ? this.channelService.directMessages
        : this.channelService.channelMessages;

      const messages = store[target] || [];

      const index = messages.findIndex((m: ChatMessage) => m.id === root.id);
      if (index !== -1) {
        messages[index] = { ...root };

        store[target] = messages;

        this.channelService.updateMessagesForActiveTarget();
      }
    }
  }

  setInitialReplyText(text: string): void {
    this._initialReplyText.next(text);
  }

  close(): void {
    this._threadRootMessage.next(null);
    this._threadReplies.next([]);
    this._initialReplyText.next('');
    this.isThreadView = false;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class ThreadPanelService {
  private _threadRootMessage = new BehaviorSubject<ChatMessage | null>(null);
  private _threadReplies = new BehaviorSubject<ChatMessage[]>([]);
  private _initialReplyText = new BehaviorSubject<string>('');

  threadRootMessage$ = this._threadRootMessage.asObservable();
  threadReplies$ = this._threadReplies.asObservable();
  initialReplyText$ = this._initialReplyText.asObservable();


  openThread(rootMessage: ChatMessage, initialReply: string = '') {
    this._threadRootMessage.next(rootMessage);
    this._threadReplies.next(rootMessage.replies || []);
    this._initialReplyText.next(initialReply);
  }


  addReply(reply: ChatMessage) {
    const replies = [...this._threadReplies.value, reply];
    this._threadReplies.next(replies);

    const root = this._threadRootMessage.value;
    if (root) {
      root.replies = replies;
    }
  }


  close() {
    this._threadRootMessage.next(null);
    this._threadReplies.next([]);
    this._initialReplyText.next('');
  }
}

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
  edited?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ThreadPanelService {
  private _threadRootMessage = new BehaviorSubject<ChatMessage | null>(null);
  private _threadReplies = new BehaviorSubject<ChatMessage[]>([]);
  private _initialReplyText = new BehaviorSubject<string>('');

  /** Observable für das Root-Element (die ursprüngliche Nachricht) */
  threadRootMessage$ = this._threadRootMessage.asObservable();

  /** Observable für die Antworten */
  threadReplies$ = this._threadReplies.asObservable();

  /** Observable für vorbefüllten Nachrichtentext */
  initialReplyText$ = this._initialReplyText.asObservable();

  /**
   * Öffnet den Thread zu einer bestimmten Nachricht.
   * @param rootMessage Die Ursprungsnachricht
   * @param initialReply (optional) Vorbefüllter Nachrichtentext
   */
  openThread(rootMessage: ChatMessage, initialReply: string = ''): void {
    this._threadRootMessage.next(rootMessage);
    this._threadReplies.next(rootMessage.replies || []);
    this._initialReplyText.next(initialReply);
  }

  /**
   * Fügt eine neue Antwort im Thread hinzu
   * @param reply Die Antwortnachricht
   */
  addReply(reply: ChatMessage): void {
    const updatedReplies = [...this._threadReplies.value, reply];
    this._threadReplies.next(updatedReplies);

    const root = this._threadRootMessage.value;
    if (root) {
      root.replies = updatedReplies;
    }
  }

  /**
   * Setzt den vorgefüllten Text manuell (z. B. bei "Antworten an")
   */
  setInitialReplyText(text: string): void {
    this._initialReplyText.next(text);
  }

  /**
   * Schließt den Thread
   */
  close(): void {
    this._threadRootMessage.next(null);
    this._threadReplies.next([]);
    this._initialReplyText.next('');
  }
}

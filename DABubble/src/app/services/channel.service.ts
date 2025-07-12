import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Typen */
export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

export interface Channel {
  name: string;
  description?: string;
  createdBy?: string;
  members?: ChatUser[];
}

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  // Aktiver Channel
  private activeChannelSubject = new BehaviorSubject<Channel>({
    name: 'Entwicklerteam',
    description:
      'Dieser Channel ist für alles rund um #Entwicklerteam vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.',
    createdBy: 'Noah Braun',
  });
  activeChannel$ = this.activeChannelSubject.asObservable();

  // Aktiver DM-Nutzer (wenn aktiv)
  private activeUserSubject = new BehaviorSubject<ChatUser | null>(null);
  activeUser$ = this.activeUserSubject.asObservable();

  // Nachrichten-Stream (je nach Target)
  private messagesSubject = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSubject.asObservable();

  // Datenhaltung
  private channelMembers: Record<string, ChatUser[]> = {};
  private channelDescriptions: Record<string, string> = {};
  private channelCreators: Record<string, string> = {};

  directMessages: Record<string, any[]> = {};
  channelMessages: Record<string, any[]> = {};

  constructor() {}

  /** Aktiven Channel zurückgeben */
  getCurrentChannel(): Channel {
    return this.activeChannelSubject.value;
  }

  /** Channel aktivieren */
  setActiveChannel(channel: Channel): void {
    // Speichere optional bereitgestellte Infos
    if (channel.members) {
      this.channelMembers[channel.name] = channel.members;
    }

    if (channel.description) {
      this.channelDescriptions[channel.name] = channel.description;
    }

    if (channel.createdBy) {
      this.channelCreators[channel.name] = channel.createdBy;
    }

    this.activeChannelSubject.next(channel);
    this.updateMessagesForActiveTarget();
  }

  /** Beschreibung lesen */
  getDescription(channelName: string): string {
    return this.channelDescriptions[channelName] || '';
  }

  /** Beschreibung setzen */
  setDescription(channelName: string, description: string): void {
    this.channelDescriptions[channelName] = description;

    const current = this.getCurrentChannel();
    if (current.name === channelName) {
      this.activeChannelSubject.next({ ...current, description });
    }
  }

  /** Ersteller eines Channels lesen */
  getCreatedBy(channelName: string): string {
    return this.channelCreators[channelName] || 'Unbekannt';
  }

  /** Ersteller setzen */
  setCreatedBy(channelName: string, creator: string): void {
    this.channelCreators[channelName] = creator;

    const current = this.getCurrentChannel();
    if (current.name === channelName) {
      this.activeChannelSubject.next({ ...current, createdBy: creator });
    }
  }

  /** Mitglieder lesen */
  getMembersForChannel(name: string): ChatUser[] {
    return this.channelMembers[name] || [];
  }

  /** Mitglieder setzen */
  setMembersForChannel(name: string, members: ChatUser[]): void {
    this.channelMembers[name] = members;

    const current = this.getCurrentChannel();
    if (current.name === name) {
      this.activeChannelSubject.next({ ...current, members });
    }
  }

  /** Direktnachrichten-User setzen */
  setActiveUser(user: ChatUser | null): void {
    this.activeUserSubject.next(user);
    this.updateMessagesForActiveTarget();
  }

  /** Nachricht hinzufügen */
  addMessage(targetId: string, message: any, isDM: boolean = false): void {
    const storage = isDM ? this.directMessages : this.channelMessages;
    if (!storage[targetId]) {
      storage[targetId] = [];
    }
    storage[targetId].push(message);

    this.updateMessagesForActiveTarget();
  }

  /** Nachrichten je nach Target setzen */
  updateMessagesForActiveTarget(): void {
    const user = this.activeUserSubject.value;
    if (user) {
      this.messagesSubject.next([...this.directMessages[user.id] || []]);
    } else {
      const channel = this.getCurrentChannel().name;
      this.messagesSubject.next([...this.channelMessages[channel] || []]);
    }
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CurrentUser } from './current.user.service';
import { CurrentUserService } from './current.user.service';


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

@Injectable({ providedIn: 'root' })
export class ChannelService {
  private channels: Channel[] = [];
  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  channels$ = this.channelsSubject.asObservable();

   users: CurrentUser[] = [];

  private activeChannelSubject = new BehaviorSubject<Channel | null>(null);
  activeChannel$ = this.activeChannelSubject.asObservable();

  private activeUserSubject = new BehaviorSubject<ChatUser | null>(null);
  activeUser$ = this.activeUserSubject.asObservable();

  private messagesSubject = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private channelMembers: Record<string, ChatUser[]> = {};
  private channelDescriptions: Record<string, string> = {};
  private channelCreators: Record<string, string> = {};

  directMessages: Record<string, any[]> = {};
  channelMessages: Record<string, any[]> = {};

  constructor(private currentUserService: CurrentUserService) {}

  // CHANNELS

  getChannels(): Channel[] {
    return this.channels;
  }

  setChannels(channels: Channel[]) {
    this.channels = [...channels];
    this.channelsSubject.next(this.channels);
  }

  addChannel(channel: Channel) {
    this.channels.push(channel);
    this.channelsSubject.next(this.channels);
  }

  updateChannel(updated: Channel) {
    const idx = this.channels.findIndex((c) => c.name === updated.name);
    if (idx !== -1) {
      this.channels[idx] = updated;
      this.channelsSubject.next(this.channels);
    }
  }

removeChannel(name: string) {
  console.log('[DEBUG] ChannelService.removeChannel: Entferne Channel:', name);

  this.channels = this.channels.filter((c) => c.name !== name);
  this.channelsSubject.next(this.channels);

  if (this.getCurrentChannel()?.name === name) {
    console.log('[DEBUG] Der zu entfernende Channel ist gerade aktiv – setze aktiv auf null');
    this.activeChannelSubject.next(null);
  }

  delete this.channelMessages[name];
  delete this.channelMembers[name];
  delete this.channelDescriptions[name];
  delete this.channelCreators[name];

  console.log('[DEBUG] Channel erfolgreich entfernt:', name);
}



  renameChannel(oldName: string, newName: string) {
    const channel = this.channels.find((c) => c.name === oldName);
    if (!channel) return;

    channel.name = newName;
    this.updateChannel(channel);

    if (this.channelMessages[oldName]) {
      this.channelMessages[newName] = this.channelMessages[oldName];
      delete this.channelMessages[oldName];
    }

    if (this.channelMembers[oldName]) {
      this.channelMembers[newName] = this.channelMembers[oldName];
      delete this.channelMembers[oldName];
    }

    if (this.channelDescriptions[oldName]) {
      this.channelDescriptions[newName] = this.channelDescriptions[oldName];
      delete this.channelDescriptions[oldName];
    }

    if (this.channelCreators[oldName]) {
      this.channelCreators[newName] = this.channelCreators[oldName];
      delete this.channelCreators[oldName];
    }

    if (this.getCurrentChannel()?.name === oldName) {
      this.setActiveChannel(channel);
    }
  }

  // ACTIVE CHANNEL & USER

  getCurrentChannel(): Channel | null {
    return this.activeChannelSubject.value;
  }

setActiveChannel(channel: Channel | null) {
  const current = this.getCurrentChannel();

  // Wenn es sich um denselben Channel handelt, trotzdem neu setzen (z. B. zur Reaktivierung nach Wechsel)
  const isSame = current?.name === channel?.name;

  // Immer subject aktualisieren, auch wenn es der gleiche Name ist
  this.activeChannelSubject.next(channel ?? null);

  // DM beenden, wenn Channel aktiv gesetzt wird
  this.setActiveUser(null);

  if (!channel) {
    this.messagesSubject.next([]);
    return;
  }

  // Optional: Metadaten speichern
  if (channel.members) {
    this.setMembersForChannel(channel.name, channel.members);
  }
  if (channel.description) {
    this.setDescription(channel.name, channel.description);
  }
  if (channel.createdBy) {
    this.setCreatedBy(channel.name, channel.createdBy);
  }

  // Nachrichten sicher nachladen, auch bei gleichem Channel-Namen
  this.updateMessagesForActiveTarget();
}





  setActiveUser(user: ChatUser | null) {
    this.activeUserSubject.next(user);
    this.updateMessagesForActiveTarget();
  }

  // MESSAGES

  addMessage(targetId: string, message: any, isDM = false) {
    const store = isDM ? this.directMessages : this.channelMessages;
    if (!store[targetId]) store[targetId] = [];
    store[targetId].push(message);
    this.updateMessagesForActiveTarget();
  }

  updateMessagesForActiveTarget() {
  const currentUser = this.currentUserService.getCurrentUser();
  const user = this.activeUserSubject.value;

  let messages: any[] = [];

  if (user) {
    messages = [...this.directMessages[user.id] || []];
  } else {
    const channel = this.getCurrentChannel()?.name;
    if (channel) {
      messages = [...this.channelMessages[channel] || []];
    }
  }

  // 👇 Setze isSelf auf Basis von currentUser.id
  const processed = messages.map((msg) => ({
    ...msg,
    isSelf: msg.userId === currentUser?.id,
  }));

  this.messagesSubject.next(processed);
}


  // METADATEN (Beschreibung, Ersteller, Mitglieder)

  getDescription(name: string): string {
    return this.channelDescriptions[name] || '';
  }

  setDescription(name: string, desc: string) {
    this.channelDescriptions[name] = desc;
    const current = this.getCurrentChannel();
    if (current && current.name === name) {
      this.activeChannelSubject.next({ ...current, description: desc });
    }
  }

  getCreatedBy(name: string): string {
    return this.channelCreators[name] || '';
  }

  setCreatedBy(name: string, creator: string) {
    this.channelCreators[name] = creator;
    const current = this.getCurrentChannel();
    if (current && current.name === name) {
      this.activeChannelSubject.next({ ...current, createdBy: creator });
    }
  }

  getMembersForChannel(name: string): ChatUser[] {
    return this.channelMembers[name] || [];
  }

  setMembersForChannel(name: string, members: ChatUser[]) {
    this.channelMembers[name] = members;
    const current = this.getCurrentChannel();
    if (current && current.name === name) {
      this.activeChannelSubject.next({ ...current, members });
    }
  }
clearMessages() {
  this.messagesSubject.next([]);
}

  setActiveChannelByName(name: string) {
  const channel = this.channels.find((c) => c.name === name);
  if (channel) {
    this.setActiveChannel(channel);
  }
}

setActiveUserById(id: string) {
  const user = this.users.find((u) => u.id === id);
  if (user) {
    this.setActiveUser(user);
  }
}

getDateKey(msg: any): string {
  const date = msg.timestamp ? new Date(msg.timestamp) : new Date();
  return isNaN(date.getTime()) ? 'unbekannt' : date.toISOString().split('T')[0];
}

getCurrentUser(): ChatUser | null {
  return this.activeUserSubject.getValue();
}



}

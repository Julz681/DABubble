import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private activeChannelSubject = new BehaviorSubject<{ name: string; members?: any[] }>({ name: 'Entwicklerteam' });
  activeChannel$ = this.activeChannelSubject.asObservable();

  private activeUserSubject = new BehaviorSubject<any | null>(null);
  activeUser$ = this.activeUserSubject.asObservable();

  private messagesSubject = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private channelMembers: { [channelName: string]: any[] } = {};
  directMessages: { [userId: string]: any[] } = {};
  channelMessages: { [channelName: string]: any[] } = {};

  constructor() {}


  getCurrentChannel(): { name: string; members?: any[] } {
    return this.activeChannelSubject.value;
  }


  setActiveChannel(channel: { name: string; members?: any[] }) {
    if (channel.members) {
      this.channelMembers[channel.name] = channel.members;
    }
    this.activeChannelSubject.next(channel);
    this.updateMessagesForActiveTarget();
  }

  getMembersForChannel(name: string): any[] {
    return this.channelMembers[name] || [];
  }

  setMembersForChannel(name: string, members: any[]) {
    this.channelMembers[name] = members;
  }


  setActiveUser(user: any) {
    this.activeUserSubject.next(user);
    this.updateMessagesForActiveTarget();
  }


  addMessage(targetId: string, message: any, isDM: boolean = false): void {
    if (isDM) {
      if (!this.directMessages[targetId]) {
        this.directMessages[targetId] = [];
      }
      this.directMessages[targetId].push(message);
    } else {
      if (!this.channelMessages[targetId]) {
        this.channelMessages[targetId] = [];
      }
      this.channelMessages[targetId].push(message);
    }

    this.updateMessagesForActiveTarget();
  }


  updateMessagesForActiveTarget() {
    const user = this.activeUserSubject.value;
    if (user) {
      const userId = user.id;
      this.messagesSubject.next([...(this.directMessages[userId] || [])]);
    } else {
      const channel = this.getCurrentChannel().name;
      this.messagesSubject.next([...(this.channelMessages[channel] || [])]);
    }
  }
}

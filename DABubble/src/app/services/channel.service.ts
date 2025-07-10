import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private activeChannelSubject = new BehaviorSubject<{ name: string; members?: any[] }>({ name: 'Entwicklerteam' });
  activeChannel$ = this.activeChannelSubject.asObservable();

  private channelMembers: { [channelName: string]: any[] } = {};

  setActiveChannel(channel: { name: string; members?: any[] }) {
    if (channel.members) {
      this.channelMembers[channel.name] = channel.members;
    }
    this.activeChannelSubject.next(channel);
  }

  getMembersForChannel(name: string): any[] {
    return this.channelMembers[name] || [];
  }

  setMembersForChannel(name: string, members: any[]) {
    this.channelMembers[name] = members;
  }
}

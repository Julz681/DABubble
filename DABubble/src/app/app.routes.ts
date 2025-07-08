import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatLayoutComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'channel', component: ChannelDialogComponent },
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatWindowComponent },
  { path: 'chat/:user', component: ChatWindowComponent },
];

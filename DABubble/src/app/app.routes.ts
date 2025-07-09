import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ShellComponent } from './shell/shell.component';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ProfileComponent } from './profile/profile.component';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';

export const routes: Routes = [
  // Standard: Weiterleitung zur Login-Seite
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login separat ohne Shell-Layout
  { path: 'login', component: LoginComponent },

  // App-Bereich: Alles in der Shell (Header, Sidebar, etc.)
  {
    path: 'app',
    component: ShellComponent,
    children: [
      {
        path: '',
        component: ChatLayoutComponent,
        children: [
          { path: '', component: ChatWindowComponent },           // /app
          { path: 'chat/:user', component: ChatWindowComponent }, // /app/chat/:user
        ]
      },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  // Channel-Dialog optional direkt zugänglich (nur falls gewünscht)
  { path: 'channel', component: ChannelDialogComponent },

  // Fallback: Undefinierte Routen zur Login-Seite
  { path: '**', redirectTo: 'login' }
];

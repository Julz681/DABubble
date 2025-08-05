import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AvatarSelectComponent } from './avatar-select/avatar-select.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { ImpressumComponent } from './impressum/impressum.component';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';

import { ShellComponent } from './shell/shell.component';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ProfileComponent } from './profile/profile.component';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'avatar-select', component: AvatarSelectComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'datenschutz', component: DatenschutzComponent },

  {
    path: 'app',
    component: ShellComponent,
    children: [
      {
        path: '',
        component: ChatLayoutComponent,
        children: [
          { path: '', component: ChatWindowComponent },
          { path: 'chat/:user', component: ChatWindowComponent },
          { path: 'channels/:channel', component: ChatWindowComponent },
        ],
      },
      { path: 'profile', component: ProfileComponent },
    ],
  },

  { path: 'channel', component: ChannelDialogComponent },

  { path: '**', redirectTo: 'login' },
];

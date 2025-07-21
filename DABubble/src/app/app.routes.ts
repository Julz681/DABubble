import { Routes } from '@angular/router';

// 🔹 Public Components (ohne Layout)
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AvatarSelectComponent } from './avatar-select/avatar-select.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component'; // ⬅️ NEU

// 🔹 Rechtliche Seiten
import { ImpressumComponent } from './impressum/impressum.component';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';

// 🔹 Haupt-App-Komponenten (mit Shell-Layout)
import { ShellComponent } from './shell/shell.component';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ProfileComponent } from './profile/profile.component';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';

export const routes: Routes = [
  // 🔸 Startseite leitet direkt zur Login-Seite
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🔸 Öffentliche Seiten
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'avatar-select', component: AvatarSelectComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: 'datenschutz', component: DatenschutzComponent },

  // 🔹 Geschützte App-Routen mit Layout
  {
    path: 'app',
    component: ShellComponent,
    children: [
      {
        path: '',
        component: ChatLayoutComponent,
        children: [
          { path: '', component: ChatWindowComponent },             // /app
          { path: 'chat/:user', component: ChatWindowComponent }    // /app/chat/max
        ]
      },
      { path: 'profile', component: ProfileComponent }              // /app/profile
    ]
  },

  // 🔸 Optional direkt aufrufbarer Channel-Dialog
  { path: 'channel', component: ChannelDialogComponent },

  // 🔸 Fallback für ungültige Pfade
  { path: '**', redirectTo: 'login' }
];

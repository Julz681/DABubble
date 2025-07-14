import { Routes } from '@angular/router';

// 🔹 Public Components (ohne Layout)
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

// 🔹 Shell Layout & App-intern
import { ShellComponent } from './shell/shell.component';
import { ChatLayoutComponent } from './chat-layout/chat-layout.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ProfileComponent } from './profile/profile.component';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';

export const routes: Routes = [
  // 🔸 Startseite leitet weiter zur Login-Seite
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🔸 Öffentliche Seiten (Login & Registrierung)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🔹 Haupt-App (mit Shell als Layout-Komponente)
  {
    path: 'app',
    component: ShellComponent,
    children: [
      {
        path: '',
        component: ChatLayoutComponent,
        children: [
          { path: '', component: ChatWindowComponent }, // /app
          { path: 'chat/:user', component: ChatWindowComponent } // /app/chat/max
        ]
      },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  // 🔸 Optional: Channel-Dialog direkt aufrufbar
  { path: 'channel', component: ChannelDialogComponent },

  // 🔸 Fallback: Alles andere zur Login-Seite
  { path: '**', redirectTo: 'login' }
];

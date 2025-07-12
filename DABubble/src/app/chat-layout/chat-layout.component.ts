import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ThreadPanelComponent } from '../thread-panel/thread-panel.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ChatWindowComponent,
    ThreadPanelComponent,
    RouterModule,
  ],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.scss']
})
export class ChatLayoutComponent {
  isSidebarCollapsed = false;
  isThreadPanelOpen = false;

  constructor(public router: Router) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeThreadPanel() {
    this.isThreadPanelOpen = false;
  }

  openThreadPanel() {
    this.isThreadPanelOpen = true;
  }

  isLoginPage(): boolean {
    return this.router.url.startsWith('/login');
  }
}

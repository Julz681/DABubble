import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ThreadPanelComponent } from '../thread-panel/thread-panel.component';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ChatWindowComponent,
    ThreadPanelComponent
  ],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.scss']
})
export class ChatLayoutComponent {
  isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}

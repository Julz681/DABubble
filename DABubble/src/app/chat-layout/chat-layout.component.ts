import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ThreadPanelComponent } from '../thread-panel/thread-panel.component';
import { Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NewMessageComponent } from '../new-message/new-message.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    ChatWindowComponent,
    ThreadPanelComponent,
    RouterModule,
    MatTooltipModule,
    NewMessageComponent
  ],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.scss']
})
export class ChatLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  isThreadPanelOpen = false;
  isComposingNewMessage = false;

  isMobile = false;
  currentMobileView: 'sidebar' | 'main' | 'thread' = 'sidebar';

  constructor(
  public router: Router,
  private cdRef: ChangeDetectorRef
) {}



  ngOnInit() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile.bind(this));
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 900;

    // Default to sidebar view on resize if mobile
    if (this.isMobile && !this.currentMobileView) {
      this.currentMobileView = 'sidebar';
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

openThreadPanel() {
  this.isComposingNewMessage = false;
  this.isThreadPanelOpen = true;
  if (this.isMobile) {
    this.currentMobileView = 'thread';
  }
}


  closeThreadPanel() {
    this.isThreadPanelOpen = false;
    if (this.isMobile) {
      this.currentMobileView = 'main';
    }
  }

  startNewMessage() {
    this.isComposingNewMessage = true;
    if (this.isMobile) {
      this.currentMobileView = 'main';
    }
  }

  cancelNewMessage() {
    this.isComposingNewMessage = false;
    if (this.isMobile) {
      this.currentMobileView = 'sidebar';
    }
  }

openChat() {
  this.isComposingNewMessage = false; 
  if (this.isMobile) {
    this.currentMobileView = 'main';
  }
}


  isLoginPage(): boolean {
    return this.router.url.startsWith('/login');
  }
switchToMainView() {
  console.log('[ChatLayout] switchToMainView called');
  if (this.isMobile) {
    this.currentMobileView = 'main';
    this.cdRef.detectChanges(); // <-- neu
  }
}


}

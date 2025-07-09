import { Component } from '@angular/core';
import { ChatLayoutComponent } from '../chat-layout/chat-layout.component';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  imports: [ChatLayoutComponent, MatIcon],
  styleUrls: ['./shell.component.scss'],
  standalone: true
})
export class ShellComponent {}

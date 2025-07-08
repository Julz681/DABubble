import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-thread-panel',
  standalone: true,
imports: [
  CommonModule,
  FormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule
],
  templateUrl: './thread-panel.component.html',
  styleUrls: ['./thread-panel.component.scss']
})
export class ThreadPanelComponent {}

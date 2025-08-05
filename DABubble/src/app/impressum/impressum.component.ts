import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatCardModule],
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.scss'],
})
export class ImpressumComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}

import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-datenschutz',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './datenschutz.component.html',
  styleUrls: ['./datenschutz.component.scss']
})
export class DatenschutzComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}

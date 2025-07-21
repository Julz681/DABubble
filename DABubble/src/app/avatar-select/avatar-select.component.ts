import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar-select.component.html',
  styleUrls: ['./avatar-select.component.scss']
})
export class AvatarSelectComponent {
  avatars: string[] = [
    'assets/Frederik Beck.png',
    'assets/Sofia Müller.png',
    'assets/Noah Braun.png',
    'assets/Elise Roth.png',
    'assets/Elias Neumann.png',
    'assets/Steffen Hoffmann.png',
  ];

  selectedAvatar: string = '';
  defaultAvatar: string = 'assets/unknown.png';
  userName: string = 'Nutzer';

  constructor(private router: Router) {
    const storedName = localStorage.getItem('username');
    if (storedName) {
      this.userName = storedName;
    }
  }

  onAvatarSelect(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedAvatar = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

continue(): void {
  if (this.selectedAvatar) {
    localStorage.setItem('selectedAvatar', this.selectedAvatar); // speichern
    this.router.navigate(['/app']);
  }
}

}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  email = '';
  message = '';
  isError = false;

  constructor(private auth: AuthService, private router: Router) {}

  sendResetLink() {
    this.message = '';
    this.isError = false;

    if (!this.email) {
      this.message = 'Bitte gib deine E-Mail-Adresse ein.';
      this.isError = true;
      return;
    }

    this.auth.resetPassword(this.email)
      .then(() => {
        this.message = 'Eine E-Mail zum Zurücksetzen wurde versendet.';
      })
      .catch(err => {
        this.message = err.message;
        this.isError = true;
      });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}

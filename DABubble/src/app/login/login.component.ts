import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatTooltipModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Bitte E-Mail und Passwort eingeben';
      return;
    }

    this.auth.login(this.email, this.password)
      .then((cred) => {
        localStorage.setItem('username', cred.user.displayName ?? cred.user.email ?? '');
        this.router.navigate(['/app']);
      })
      .catch((err) => this.errorMessage = err.message);
  }

  loginWithGoogle() {
    this.auth.loginWithGoogle()
      .then((cred) => {
        localStorage.setItem('username', cred.user.displayName ?? cred.user.email ?? '');
        this.router.navigate(['/app']);
      })
      .catch((err) => this.errorMessage = err.message);
  }

  resetPassword() {
    this.errorMessage = '';

    if (!this.email) {
      this.errorMessage = 'Bitte gib deine E-Mail-Adresse ein.';
      return;
    }

    this.auth.resetPassword(this.email)
      .then(() => {
        this.errorMessage = 'Passwort-Zurücksetzen-Link wurde gesendet.';
      })
      .catch((err) => {
        this.errorMessage = err.message;
      });
  }

  loginAsGuest() {
    localStorage.setItem('username', 'Gast');
    this.router.navigate(['/app']);
  }
}
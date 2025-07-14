import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current.user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  agreed = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private currentUserService: CurrentUserService,
    private router: Router
  ) {}

  register() {
    this.errorMessage = '';

    if (!this.agreed) {
      this.errorMessage = 'Bitte stimme der Datenschutzerklärung zu.';
      return;
    }

    this.auth.register(this.name, this.email, this.password)
      .then((cred) => {
        this.currentUserService.refreshCurrentUser();
        localStorage.setItem('username', this.name);
        this.router.navigate(['/app']);
      })
      .catch((err) => this.errorMessage = err.message);
  }
}

import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  User,
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await cred.user.reload();
    return cred;
  }

  async register(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    await updateProfile(cred.user, { displayName: name });
    await cred.user.reload();
    return cred;
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    await cred.user.reload();
    return cred;
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  logout() {
    return this.auth.signOut();
  }
}

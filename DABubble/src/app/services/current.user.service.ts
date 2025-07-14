import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface CurrentUser {
  id: string;
  name: string;
  avatar: string;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly STORAGE_KEY = 'username';

  private readonly initialUsers: CurrentUser[] = [
    { id: 'frederik', name: 'Frederik Beck', avatar: 'assets/Frederik Beck.png' },
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png' },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png' },
    { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png' },
    { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png' },
    { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png' },
  ];

  private currentUserSubject = new BehaviorSubject<CurrentUser>({
    id: 'frederik',
    name: localStorage.getItem(this.STORAGE_KEY) || 'Frederik Beck',
    avatar: 'assets/Frederik Beck.png',
  });

  private usersSubject = new BehaviorSubject<CurrentUser[]>(this.initialUsers);
  currentUser$ = this.currentUserSubject.asObservable();
  users$ = this.usersSubject.asObservable();

  constructor(private authService: AuthService) {}

  /**
   * Ruft das aktuelle Firebase-User-Objekt ab und synchronisiert es
   * mit dem lokalen CurrentUserSubject.
   */
  refreshCurrentUser(): void {
    const firebaseUser = this.authService.currentUser;
    if (firebaseUser) {
      const displayName = firebaseUser.displayName ?? firebaseUser.email ?? 'Unbekannt';
      const user: CurrentUser = {
        id: firebaseUser.uid,
        name: displayName,
        avatar: 'assets/Frederik Beck.png', // optional dynamisch
      };

      this.currentUserSubject.next(user);
      this.updateUserInList(user);
      localStorage.setItem(this.STORAGE_KEY, displayName);
    }
  }

  getCurrentUser(): CurrentUser {
    return this.currentUserSubject.value;
  }

  getAllUsers(): CurrentUser[] {
    return this.usersSubject.value;
  }

  /**
   * Aktualisiert den angezeigten Namen des aktuellen Benutzers.
   */
  updateName(newName: string): void {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    const currentUser = this.currentUserSubject.value;
    const updatedUser: CurrentUser = {
      ...currentUser,
      name: trimmedName,
    };

    this.currentUserSubject.next(updatedUser);
    this.updateUserInList(updatedUser);
    localStorage.setItem(this.STORAGE_KEY, trimmedName);

    window.dispatchEvent(new CustomEvent('usernameChanged', { detail: trimmedName }));
  }

  /**
   * Fügt den Benutzer zur Liste hinzu oder aktualisiert ihn darin.
   */
  private updateUserInList(updatedUser: CurrentUser) {
    const users = this.usersSubject.value;
    const index = users.findIndex((u) => u.id === updatedUser.id);

    if (index > -1) {
      users[index] = updatedUser;
    } else {
      users.push(updatedUser);
    }

    this.usersSubject.next([...users]);
  }

  updateAvatar(newAvatar: string): void {
  const currentUser = this.currentUserSubject.value;
  const updatedUser: CurrentUser = {
    ...currentUser,
    avatar: newAvatar,
  };

  this.currentUserSubject.next(updatedUser);

  const updatedUsers = this.usersSubject.value.map((user) =>
    user.id === updatedUser.id ? updatedUser : user
  );
  this.usersSubject.next(updatedUsers);
}

}

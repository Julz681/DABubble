import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface CurrentUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly STORAGE_KEY = 'username';

  private readonly initialUsers: CurrentUser[] = [
    { id: 'frederik', name: 'Frederik Beck', avatar: 'assets/Frederik Beck.png', isOnline: true },
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/Sofia Müller.png', isOnline: true },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/Noah Braun.png', isOnline: true },
    { id: 'elise', name: 'Elise Roth', avatar: 'assets/Elise Roth.png', isOnline: true },
    { id: 'elias', name: 'Elias Neumann', avatar: 'assets/Elias Neumann.png', isOnline: false },
    { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/Steffen Hoffmann.png', isOnline: false },
  ];

  private currentUserSubject = new BehaviorSubject<CurrentUser>({
    id: 'frederik',
    name: localStorage.getItem(this.STORAGE_KEY) || 'Frederik Beck',
    avatar: 'assets/Frederik Beck.png',
    isOnline: true
  });

  private usersSubject = new BehaviorSubject<CurrentUser[]>(this.initialUsers);
  currentUser$ = this.currentUserSubject.asObservable();
  users$ = this.usersSubject.asObservable();

  constructor(private authService: AuthService) {}

  refreshCurrentUser(): void {
    const firebaseUser = this.authService.currentUser;

    if (firebaseUser) {
      const displayName = firebaseUser.displayName ?? firebaseUser.email ?? 'Unbekannt';

      const user: CurrentUser = {
        id: firebaseUser.uid,
        name: displayName,
        avatar: 'assets/Frederik Beck.png',
        isOnline: true
      };

      this.currentUserSubject.next(user);

      const exists = this.usersSubject.value.some(u => u.id === user.id);
      if (!exists) {
        this.usersSubject.next([...this.usersSubject.value, user]);
      }

      localStorage.setItem(this.STORAGE_KEY, displayName);
    }
  }

  getCurrentUser(): CurrentUser {
    return this.currentUserSubject.value;
  }

  getAllUsers(): CurrentUser[] {
    return this.usersSubject.value;
  }

  updateName(newName: string): void {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    const currentUser = this.currentUserSubject.value;
    const updatedUser: CurrentUser = {
      ...currentUser,
      name: trimmedName
    };

    this.currentUserSubject.next(updatedUser);
    this.updateUserInList(updatedUser);
    localStorage.setItem(this.STORAGE_KEY, trimmedName);

    window.dispatchEvent(new CustomEvent('usernameChanged', { detail: trimmedName }));
  }

  updateAvatar(newAvatar: string): void {
    const currentUser = this.currentUserSubject.value;
    const updatedUser: CurrentUser = {
      ...currentUser,
      avatar: newAvatar
    };

    this.currentUserSubject.next(updatedUser);
    this.updateUserInList(updatedUser);
  }

  private updateUserInList(updatedUser: CurrentUser): void {
    const users = this.usersSubject.value;
    const index = users.findIndex(u => u.id === updatedUser.id);

    if (index !== -1) {
      const existing = users[index];
      users[index] = {
        ...existing,
        ...updatedUser,
        isOnline: existing.isOnline // nicht überschreiben
      };
    } else {
      users.push(updatedUser);
    }

    this.usersSubject.next([...users]);
  }
}

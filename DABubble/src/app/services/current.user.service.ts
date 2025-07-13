import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
      name: trimmedName,
    };

    // Update currentUser
    this.currentUserSubject.next(updatedUser);

    // Update global user list
    const updatedUsers = this.usersSubject.value.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
    this.usersSubject.next(updatedUsers);

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, trimmedName);

    // Notify others
    window.dispatchEvent(
      new CustomEvent('usernameChanged', { detail: trimmedName })
    );
  }
}

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
  private readonly STORAGE_NAME_KEY = 'username';
  private readonly STORAGE_AVATAR_KEY = 'selectedAvatar';
  private readonly defaultAvatar = 'assets/unknown.png';

  private readonly initialUsers: CurrentUser[] = [
    {
      id: 'sofia',
      name: 'Sofia Müller',
      avatar: 'assets/Sofia Müller.png',
      isOnline: true,
    },
    {
      id: 'noah',
      name: 'Noah Braun',
      avatar: 'assets/Noah Braun.png',
      isOnline: true,
    },
    {
      id: 'elise',
      name: 'Elise Roth',
      avatar: 'assets/Elise Roth.png',
      isOnline: true,
    },
    {
      id: 'elias',
      name: 'Elias Neumann',
      avatar: 'assets/Elias Neumann.png',
      isOnline: false,
    },
    {
      id: 'steffen',
      name: 'Steffen Hoffmann',
      avatar: 'assets/Steffen Hoffmann.png',
      isOnline: false,
    },
  ];

  private currentUserSubject = new BehaviorSubject<CurrentUser>({
    id: 'local',
    name: localStorage.getItem(this.STORAGE_NAME_KEY) || 'Unbekannt',
    avatar: localStorage.getItem(this.STORAGE_AVATAR_KEY) || this.defaultAvatar,
    isOnline: true,
  });

  private usersSubject = new BehaviorSubject<CurrentUser[]>(this.initialUsers);
  currentUser$ = this.currentUserSubject.asObservable();
  users$ = this.usersSubject.asObservable();

  constructor(private authService: AuthService) {}

  refreshCurrentUser(): void {
    const firebaseUser = this.authService.currentUser;

    if (firebaseUser) {
      const displayName =
        firebaseUser.displayName ?? firebaseUser.email ?? 'Unbekannt';
      const avatar =
        localStorage.getItem(this.STORAGE_AVATAR_KEY) || this.defaultAvatar;

      const user: CurrentUser = {
        id: firebaseUser.uid,
        name: displayName,
        avatar,
        isOnline: true,
      };

      this.currentUserSubject.next(user);
      this.addOrUpdateUser(user);

      localStorage.setItem(this.STORAGE_NAME_KEY, displayName);
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
      name: trimmedName,
    };

    this.currentUserSubject.next(updatedUser);
    this.addOrUpdateUser(updatedUser);
    localStorage.setItem(this.STORAGE_NAME_KEY, trimmedName);

    window.dispatchEvent(
      new CustomEvent('usernameChanged', { detail: trimmedName })
    );
  }

  updateAvatar(newAvatar: string): void {
    const currentUser = this.currentUserSubject.value;
    const updatedUser: CurrentUser = {
      ...currentUser,
      avatar: newAvatar,
    };

    this.currentUserSubject.next(updatedUser);
    this.addOrUpdateUser(updatedUser);
    localStorage.setItem(this.STORAGE_AVATAR_KEY, newAvatar);
  }

  updateUser(data: Partial<CurrentUser>): void {
    const current = this.currentUserSubject.value;
    const updated: CurrentUser = { ...current, ...data };

    this.currentUserSubject.next(updated);
    this.addOrUpdateUser(updated);

    if (data.name) {
      localStorage.setItem(this.STORAGE_NAME_KEY, data.name);
    }
    if (data.avatar) {
      localStorage.setItem(this.STORAGE_AVATAR_KEY, data.avatar);
    }
  }

  private addOrUpdateUser(updatedUser: CurrentUser): void {
    const users = [...this.usersSubject.value];
    const index = users.findIndex((u) => u.id === updatedUser.id);

    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...updatedUser,
        isOnline: users[index].isOnline,
      };
    } else {
      users.push(updatedUser);
    }

    this.usersSubject.next(users);
  }
}

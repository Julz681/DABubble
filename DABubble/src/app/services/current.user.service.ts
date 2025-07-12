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

  private currentUserSubject = new BehaviorSubject<CurrentUser>({
    id: 'frederik',
    name: localStorage.getItem(this.STORAGE_KEY) || 'Frederik Beck',
    avatar: 'assets/Frederik Beck.png',
  });

  currentUser$ = this.currentUserSubject.asObservable();


  getCurrentUser(): CurrentUser {
    return this.currentUserSubject.value;
  }


  updateName(newName: string): void {
    const trimmedName = newName.trim();

    if (!trimmedName) return;

    const updatedUser: CurrentUser = {
      ...this.currentUserSubject.value,
      name: trimmedName,
    };

    localStorage.setItem(this.STORAGE_KEY, trimmedName);
    this.currentUserSubject.next(updatedUser);


    window.dispatchEvent(
      new CustomEvent('usernameChanged', { detail: trimmedName })
    );
  }
}

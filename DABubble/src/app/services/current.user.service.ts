// current-user.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CurrentUser {
  id: string;
  name: string;
  avatar: string;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private currentUserSubject = new BehaviorSubject<CurrentUser>({
    id: 'frederik',
    name: localStorage.getItem('username') || 'Frederik Beck',
    avatar: 'assets/Frederik Beck.png',
  });

  currentUser$ = this.currentUserSubject.asObservable();

  getCurrentUser(): CurrentUser {
    return this.currentUserSubject.value;
  }

  updateName(newName: string) {
    const updated = { ...this.currentUserSubject.value, name: newName };
    localStorage.setItem('username', newName);
    this.currentUserSubject.next(updated);
    window.dispatchEvent(new CustomEvent('usernameChanged', { detail: newName }));
  }
}

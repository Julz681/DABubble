// mobile-view.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MobileViewService {
  private mobileViewSubject = new BehaviorSubject<
    'sidebar' | 'main' | 'thread'
  >('sidebar');
  mobileView$ = this.mobileViewSubject.asObservable();

  setView(view: 'sidebar' | 'main' | 'thread') {
    this.mobileViewSubject.next(view);
  }
}

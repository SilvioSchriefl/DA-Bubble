import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private activitySubject = new Subject<void>();
  private inactivityTimer: number;

  private resetTimer(): void {
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = window.setTimeout(() => {
      this.activitySubject.next();
    }, this.getInactivityDuration());
  }


  private getInactivityDuration(): number {
    return 15 * 60 * 1000;
  }


  startMonitoring(): void {
    document.addEventListener('mousemove', () => this.resetTimer());
    document.addEventListener('keydown', () => this.resetTimer());
    this.resetTimer();
  }


  get inactivityObservable(): Observable<void> {
    return this.activitySubject.asObservable();
  }
}

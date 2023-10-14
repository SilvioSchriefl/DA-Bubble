import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralFunctionsService {
  showSidebarText: boolean = true;
  changeMobileLogo: boolean = false;
  isMobileScreen: boolean = false;
  public highlightInput: Subject<boolean> = new Subject<boolean>();

  constructor() {}

  preventDefault(event: Event) {
    event.preventDefault();
  };

  stopPropagation(event: Event) {
    event.stopPropagation();
  };

  async generateCustomFirestoreID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters.charAt(randomIndex);
    }
    return id;
  }

  isMobileWidth() {
    return window.innerWidth <= 1000;
  }

  isDesktopWidth() {
    return window.innerWidth > 1000;
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ProfileMenuComponent } from '../profile-menu/profile-menu.component';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { ChatService } from 'services/chat.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { ProfileService } from 'services/profile.service';

@Component({
  selector: 'app-desktop-header',
  templateUrl: './desktop-header.component.html',
  styleUrls: ['./desktop-header.component.scss']
})
export class DesktopHeaderComponent {

  @ViewChild('profile') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  profileMenuRef: MatDialogRef<ProfileMenuComponent>;
  profileMenuOpen: boolean = false;
  all_users: any[];


  constructor(private dialog: MatDialog,
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public chatService: ChatService,
    public genFuncService: GeneralFunctionsService,
    public profileService: ProfileService) { }

  /**
   * Opens the profile menu, setting the position based on the element's bounds and screen width.
   * Listens for the dialog's close event and handles the cleanup.
   */
  openProfileMenu() {
    const rect = this.ElementEditChannelRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();
    this.checkMobileOrDesktopVersion(dialogConfig, rect);
    this.profileMenuRef = this.dialog.open(ProfileMenuComponent, dialogConfig);
    this.profileMenuOpen = true;
    this.profileMenuRef.afterClosed().subscribe(() => {
      this.profileMenuOpen = false;
      this.fsDataThreadService.detailsVisible = false;
    });
  }

  /**
  * Checks if the screen width corresponds to mobile or desktop. 
  * Sets the dialog's configuration based on the screen width.
  * @param {MatDialogConfig} dialogConfig - The configuration for the dialog.
  * @param {ClientRect} rect - The bounding client rect of the reference element.
  */
  checkMobileOrDesktopVersion(dialogConfig, rect) {
    if (this.genFuncService.isMobileWidth()) {
      dialogConfig.position = {
        bottom: `0px`
      }
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.panelClass = 'mobile-profile-menu-dialog';
    } else {
      dialogConfig.position = {
        top: `${rect.bottom + 5}px`,
        right: `25px`
      };
      dialogConfig.panelClass = 'custom-open-profile-menu-dialog';
    }
  }

  /**
  * Closes the chat and resets related properties to their default values.
  */
  closeChat() {
    this.genFuncService.changeMobileLogo = false;
    this.chatService.open_chat = false;
    this.chatService.thread_open = false;
    this.chatService.currentChatID = '';
  }
}

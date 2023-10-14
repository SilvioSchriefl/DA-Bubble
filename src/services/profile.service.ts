import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogProfileComponent } from 'app/dialog-profile/dialog-profile.component';
import { AuthenticationService } from './authentication.service';
import { ChatService } from './chat.service';
import { FirestoreThreadDataService } from './firestore-thread-data.service';
import { MessagesService } from './messages.service';
import { ReactionBubbleService } from './reaction-bubble.service';
import { UploadService } from './upload.service';
import { ProfileMenuComponent } from 'app/profile-menu/profile-menu.component';
import { GeneralFunctionsService } from './general-functions.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  profileMenuRef: MatDialogRef<ProfileMenuComponent>;

  constructor(
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public dialog: MatDialog,
    public msgService: MessagesService,
    public chatService: ChatService,
    public uploadService: UploadService,
    public reactionBubbleService: ReactionBubbleService,
    public generalFunctService: GeneralFunctionsService
  ) { }


  /**
  * Opens the user profile based on the provided user ID. If it's the current user's profile, it opens their details.
  * @param {string} uid - User ID for which the profile should be opened.
  */
  openProfile(uid: string) {
    if (this.checkIfStringIsAnId(uid)) {
      if (this.authService.getUserInfo(uid).user_name == this.authService.userData.user_name && this.checkIfStringIsAnId(uid)) this.openCurrentUserDetails()
      else {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.panelClass = 'dialog_profile';
        dialogConfig.data = { user: this.authService.getUserInfo(uid) };
        this.dialog.open(DialogProfileComponent, dialogConfig);
      }
    }
  }


  /**
  * Checks if the given string matches a user ID from the 'all_users' collection.
  * @param {string} uid - String to check against the list of user IDs.
  * @returns {boolean} - Returns true if the string is an ID, otherwise returns false.
  */
  checkIfStringIsAnId(uid: string) {
    const user = this.authService.all_users.find(element => element.uid === uid);
    if (user) return true
    else return false
  }


  /**
  * Opens the details for the currently logged-in user.
  */
  openCurrentUserDetails() {
    const dialogConfig = new MatDialogConfig();
    if (this.generalFunctService.isDesktopWidth()) {
      dialogConfig.position = {
        top: '0px',
        right: '0px'
      }
    }
    this.profileMenuRef = this.dialog.open(ProfileMenuComponent, dialogConfig);
    this.fsDataThreadService.detailsVisible = true
    this.profileMenuRef.afterClosed().subscribe(() => {
      this.fsDataThreadService.detailsVisible = false
    });
  }


  /**
  * Retrieves the email address for a user based on the provided user ID.
  * @param {string} uid - User ID for which the email is required.
  * @returns {string} - Returns the email address of the user.
  */
  getUserEmail(uid: string) {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.email
  }
}

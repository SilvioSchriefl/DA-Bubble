import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { UploadService } from 'services/upload.service';
import { ChatService } from 'services/chat.service';


@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss']
})
export class ProfileMenuComponent {

  images = ['/assets/img/small_avatar/avatar (1).png', '/assets/img/small_avatar/avatar (2).png', '/assets/img/small_avatar/avatar (3).png', '/assets/img/small_avatar/avatar (4).png', '/assets/img/small_avatar/avatar (5).png', '/assets/img/small_avatar/avatar (6).png']
  detailsVisible: boolean = false;
  editDetailsVisible: boolean = false;
  editAvatarVisible: boolean = false
  file_error: boolean;
  uploadProgress: number = 0;
  selectedFile: File = null;
  imageUrl: string;
  current_imageUrl: string;
  current_username: string = this.authService.userData.user_name;
  current_email: string = this.authService.userData.email;

  constructor(
    public authService: AuthenticationService,
    private dialog: MatDialog,
    private storage: AngularFireStorage,
    public fsDataThreadService: FirestoreThreadDataService,
    public dialogRef: MatDialogRef<ProfileMenuComponent>,
    public uploadService: UploadService,
    public chatService: ChatService
  ) { }


  /**
  * Signs out the user, closes all dialogs, and sets the thread open variable to false.
  */
  signOut() {
    this.authService.signOut();
    this.dialog.closeAll();
    this.chatService.thread_open = false
  }


  /**
  * Toggles the visibility of the user details section. 
  * Closes the details section if it's currently visible.
  */
  toggleDetails() {
    if (this.fsDataThreadService.detailsVisible) {
      this.fsDataThreadService.detailsVisible = false
      this.onNoClick()
    }
    this.detailsVisible = !this.detailsVisible;
  }


  /**
  * Toggles the visibility of the edit details section.
  */
  toggleEditDetails() {
    this.editDetailsVisible = !this.editDetailsVisible;
  }


  /**
  * Updates the user's details based on the provided username and email.
  */
  updateUserDetails() {
    this.authService.updateUserDetails(this.current_username, this.current_email);
    this.dialog.closeAll();
    this.fsDataThreadService.detailsVisible = false;
  }


  /**
   * Initiates the process to edit the avatar image.
   */
  editAvatarImage() {
    this.current_imageUrl = this.authService.userData.avatar;
    this.editDetailsVisible = false;
    this.editAvatarVisible = true;
    this.detailsVisible = false;
  }


  /**
  * Closes the edit avatar section and reopens the edit details section.
  */
  closeEditAvatar() {
    this.editAvatarVisible = false;
    this.editDetailsVisible = true;
  }


  /**
  * Handles the event when a file is selected for upload. 
  * Checks the file type and initiates the upload if valid.
  * @param {any} $event - The triggered DOM event.
  */
  onFileSelected($event: any) {
    this.file_error = false;
    this.selectedFile = $event.target.files[0];
    if (this.selectedFile && this.selectedFile.type.startsWith('image/')) this.uploadImage();
    else this.file_error = true;
  }


  /**
   * Uploads the selected image file to storage and updates the image URL.
   */
  uploadImage() {
    this.file_error = false
    const filePath = this.authService.userData.uid + '/' + 'avatar_' + this.selectedFile.name;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, this.selectedFile);
    uploadTask.percentageChanges().subscribe(progress => {
      this.uploadProgress = progress;
    });
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(downloadURL => {
          this.imageUrl = downloadURL
          this.current_imageUrl = downloadURL
        });
      })
    ).subscribe();
  }


  /**
  * Displays a preview of the selected avatar image.
  * @param {string} imgUrl - The URL of the image.
  */
  showPreviewAvatar(imgUrl: string) {
    this.current_imageUrl = imgUrl;
  }


  /**
  * Saves the new avatar image, updates the user's avatar, 
  * and closes the dialog. Deletes the previous avatar if it's not a default image.
  */
  saveNewAvatar() {
    const decodedLink = decodeURIComponent(this.authService.userData.avatar);
    const parts = decodedLink.split('/');
    const filename = parts[parts.length - 1].split('?')[0];
    let path = this.authService.userData.uid + '/' + filename;
    this.file_error = false
    this.authService.setAvatarImage(this.current_imageUrl)
    this.dialogRef.close();
    if (!this.images.includes('/assets/img/small_avatar/' + filename)) this.uploadService.deleteFile(path)
  }


  /**
  * Closes the current dialog.
  */
  onNoClick(): void {
    this.dialogRef.close();
  }
}

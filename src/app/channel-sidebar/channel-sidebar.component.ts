import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddChannelComponent } from '../dialog-add-channel/add-channel.component';
import { Subscription } from 'rxjs';
import { ChannelService } from 'services/channel.service';
import { ChatService } from 'services/chat.service';
import { getAuth } from 'firebase/auth';
import { MessagesService } from 'services/messages.service';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { UploadService } from 'services/upload.service';
import { OpenChatService } from 'services/open-chat.service';

@Component({
  selector: 'app-channel-sidebar',
  templateUrl: './channel-sidebar.component.html',
  styleUrls: ['./channel-sidebar.component.scss'],
})
export class ChannelSidebarComponent implements OnInit, OnDestroy {
  auth = getAuth();
  @ViewChild('addChannel') public ElementEditChannelRef: ElementRef<HTMLDivElement>;
  addChannelRef: MatDialogRef<AddChannelComponent>;
  addChannelOpen: boolean = false;
  channelsVisible: boolean = true;
  dmsVisible: boolean = true;
  openNewMsg: boolean = false;
  sortedChats: any[];
  private newChannelIdSubscription: Subscription;
  currentChannelId: string;

  constructor(
    public authService: AuthenticationService,
    public dialog: MatDialog,
    public channelService: ChannelService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService,
    public genFunctService: GeneralFunctionsService,
    public uploadService: UploadService,
    public openChatService: OpenChatService
  ) {
    this.newChannelIdSubscription = this.channelService.createdChannelId$.subscribe((newId) => {
      this.currentChannelId = newId;
      if (this.currentChannelId) this.openChatService.openChat(this.currentChannelId, 'channels');
    });
  }


  /**
  * Component's initialization method. Waits for authentication, 
  * loads chats, and initializes own chat. If it's a new user, loads the start channel.
  */
  async ngOnInit() {
    await this.authService.waitUntilAuthInitialized();
    this.chatService.currentUser_id = this.auth.currentUser.uid
    await this.authService.usersPromise;
    await this.chatService.loadChats();
    await this.chatService.initOwnChat();
    if (this.authService.newUser) this.addNewUserMessageToChannel()
    this.sortedChats = this.sortChats(this.chatService.chats);
  }

  /**
  * Cleanup method for the component. Unsubscribes from the new channel ID.
  */
  ngOnDestroy() {
    if (this.newChannelIdSubscription) this.newChannelIdSubscription.unsubscribe();
  }

  /**
  * Loads the start channel for new users, checks for uploads, and sets the join message.
  */
  async addNewUserMessageToChannel() {
    this.authService.newUser = false
    this.channelService.loadStandardChannel()
    let user = this.authService.userData.user_name
    await this.uploadService.checkForUpload()
    this.msgService.messageText = user + ' ist #Entwicklerteam beigetreten.'
    await this.msgService.newMessage().then(async () => {
      this.msgService.getMessages()
    })
  }


  /**
  * Checks for mobile logo state and toggles new message component.
  */
  sendNewMsg() {
    this.checkChangeToMobileLogo();
    this.chatService.open_chat = true
    this.msgService.emptyMessageText();
    this.toggleNewMsgComponent();
  }

  /**
  * Opens the add channel dialog and handles its close event.
  */
  openAddChannelDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'add-channel-dialog';
    this.addChannelRef = this.dialog.open(AddChannelComponent, dialogConfig);
    this.addChannelOpen = true;
    this.addChannelRef.afterClosed().subscribe(() => {
      this.addChannelOpen = false;
    });
  }

  /**
  * Checks the screen width and updates the mobile logo state accordingly.
  */
  checkChangeToMobileLogo() {
    if (window.innerWidth <= 1000) {
      this.genFunctService.changeMobileLogo = true;
    }
  }

  /**
  * Toggles the visibility of the new message component.
  */
  toggleNewMsgComponent() {
    this.chatService.openNewMsgComponent = !this.chatService.openNewMsgComponent;
  }

  /**
    * Toggles the visibility of the channels.
    */
  toggleChannels() {
    this.channelsVisible = !this.channelsVisible;
  }

  /**
   * Toggles the visibility of direct messages.
   */
  toggleDms() {
    this.dmsVisible = !this.dmsVisible;
  }

  /**
  * Compares the current chat ID with the receiver's ID to determine if they're different.
  * @param {string} userReceiverID - User receiver's ID.
  * @return {boolean} - Whether the current chat ID is different from the user receiver's ID.
  */
  checkIfSameChatID(userReceiverID: string) {
    return this.chatService.currentChatID !== userReceiverID;
  }

  /**
   * Determines if a chat is associated with the current user.
   * @param {Object} chat - The chat object to check.
   * @return {boolean} - True if the chat is associated with the current user, false otherwise.
   */
  isCurrentUserChat(chat: { chat_Member_IDs: any[]; }): boolean {
    return chat.chat_Member_IDs[0] === chat.chat_Member_IDs[1] ? true : false;
  }

  /**
   * Sorts an array of chats to place the chat associated with the current user at the beginning.
   * Utilizes the isCurrentUserChat method to determine if a chat is associated with the current user.
   * If both chats being compared are or aren't associated with the current user, their relative order remains unchanged.
   * @param {Object[]} chats - The array of chat objects to be sorted.
   * @return {Object[]} - The sorted array of chats.
   */
  sortChats(chats: any[]): any[] {
    return chats.sort((a, b) => {
      if (this.isCurrentUserChat(a) && !this.isCurrentUserChat(b)) {
        return -1;
      }
      if (!this.isCurrentUserChat(a) && this.isCurrentUserChat(b)) {
        return 1;
      }
      return 0;
    });
  }
}



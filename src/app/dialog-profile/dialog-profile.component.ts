import { Component, Inject } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { ChannelService } from 'services/channel.service';
import { publishFacade } from '@angular/compiler';
import { OpenChatService } from 'services/open-chat.service';

@Component({
  selector: 'app-dialog-profile',
  templateUrl: './dialog-profile.component.html',
  styleUrls: ['./dialog-profile.component.scss']
})
export class DialogProfileComponent {

  constructor(
    public authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    public dialog: MatDialog,
    public chatService: ChatService,
    public msgService: MessagesService,
    public fsDataThreadService: FirestoreThreadDataService,
    public channelService: ChannelService,
    public openChatService: OpenChatService 
  ) { }


  /**
  * Sends a message to the specified user by ID and name, sets the receiver data,
  * checks for an existing chat with the user or creates a new one, and then closes the current context.
  * @param {string} user_id - ID of the user to send the message to.
  * @param {string} user_name - Name of the user to send the message to.
  */
  async sendMsg(user_id: string, user_name: string) {
    this.setReceiverData(user_id, user_name);
    await this.findChatWithUser(this.chatService.currentUser_id, this.chatService.userReceiverID);
    this.chatService.directedFromProfileButton = true;
    this.close();
  }


  /**
  * Finds an existing chat with the selected user based on their UIDs.
  * Opens the chat if found or creates a new one if not.
  * @param {string} currentUserUID - UID of the current user.
  * @param {string} selectedUserUID - UID of the selected user.
  */
  async findChatWithUser(currentUserUID: string, selectedUserUID: string) {
    for (const chat of this.chatService.chats) {
      if (
        chat.chat_Member_IDs.includes(currentUserUID) &&
        chat.chat_Member_IDs.includes(selectedUserUID)) {
        this.openChat(chat.chat_ID);
        return;
      }
    }
    await this.createNewChat();
  }


  /**
  * Opens a chat based on its ID. Ensures the chat section is visible and loads the chat data.
  * @param {string} id - ID of the chat to open.
  */
  async openChat(id: string) {
    this.ensureChatSectionVisible();
    if (this.chatService.currentChatID !== id) {
      this.chatService.currentChatSection = 'chats';
      this.setCurrentID(id);
      await this.getCurrentData();
    }
  }


  /**
  * Creates a new chat with the selected user.
  */
  async createNewChat() {
    this.chatService.openNewMsgComponent = true;
    this.chatService.currentChatSection = 'chats';
    this.chatService.currentChatID = await this.chatService.newChat(this.chatService.userReceiverID);
    this.chatService.currentChatData = await this.chatService.getChatDocument();
    this.chatService.textAreaMessageTo();
    this.msgService.getMessages();
    this.openChat(this.chatService.currentChatData.chat_ID);
  }


  /**
  * Sets the current chat ID and empties the message text area.
  * @param {string} id - ID of the current chat.
  */
  setCurrentID(id: string) {
    this.chatService.currentChatID = id;
    this.msgService.emptyMessageText();
  }


  /**
  * Loads the current chat data and messages.
  */
  async getCurrentData() {
    this.chatService.getCurrentChatData();
    this.chatService.textAreaMessageTo();
    this.msgService.getMessages().then(() => {
      this.chatService.thread_open = false;
      this.msgService.scrollToBottom('channel')
    });
  }


  /**
  * Ensures that the chat section is visible to the user.
  */
  ensureChatSectionVisible() {
    this.chatService.open_chat = true
    this.chatService.userReceiverName = '';
    if (this.chatService.openNewMsgComponent) this.chatService.openNewMsgComponent = false;
  }


  /**
  * Sets the receiver data for the chat service.
  * @param {string} user_id - ID of the receiver.
  * @param {string} user_name - Name of the receiver.
  */
  setReceiverData(user_id: string, user_name: string) {
    this.chatService.userReceiverID = user_id;
    this.chatService.userReceiverName = user_name;
  }


  /**
  * Closes all open dialogs.
  */
  close() {
    this.dialog.closeAll()
  }
}

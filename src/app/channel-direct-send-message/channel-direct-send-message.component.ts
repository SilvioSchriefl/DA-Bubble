import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ChatService } from 'services/chat.service';
import { EmojiService } from 'services/emoji.service';
import { MessagesService } from 'services/messages.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { UploadService } from 'services/upload.service';
import { AuthenticationService } from 'services/authentication.service';
import { GeneralFunctionsService } from 'services/general-functions.service';

@Component({
  selector: 'app-channel-direct-send-message',
  templateUrl: './channel-direct-send-message.component.html',
  styleUrls: ['./channel-direct-send-message.component.scss']
})
export class ChannelDirectSendMessageComponent {
  @Input() inputValue: string;
  @Input() selectedValue?: string;
  open_attachment_menu: boolean = false;
  open_users: boolean = false;
  @ViewChild('messageTextarea') messageTextarea: ElementRef;

  constructor(
    public authService: AuthenticationService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public fsDataThreadService: FirestoreThreadDataService,
    public uploadService: UploadService,
    public genFService: GeneralFunctionsService,
    private elementRef: ElementRef
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.open_attachment_menu = false;
      this.open_users = false;
    }
  }


  togglePopup(popupVariable: string) {
    if (popupVariable === 'emojiPicker_open') {
      this.toggleEmojiPicker()
    } else {
      this[popupVariable] = !this[popupVariable];
      this.closeOtherPopups(popupVariable);
      this.uploadService.chat_section = 'channel'
    }
    if (popupVariable === 'open_users') {
      this.getAllUsers()
    }
  }


  toggleEmojiPicker() {
    this.emojiService.emojiPicker_open = !this.emojiService.emojiPicker_open;
  }


  closeOtherPopups(currentPopup: string) {
    const popupVariables = ['open_attachment_menu', 'open_users'];
    popupVariables.forEach(popup => {
      if (popup !== currentPopup) {
        this[popup] = false;
      }
    });
  }


  addEmojitoTextarea($event: any) {
    this.emojiService.addEmojitoTextarea($event)
    this.msgService.messageText += this.emojiService.textMessage;
    this.emojiService.textMessage = '';
    this.msgService.checkIfEmpty();
  }

  public async onSendClick() {    
    if (!this.validateNewMessageComponentConditions()) {
      return;
    }
    if (this.textMessageNotEmpty()|| this.fileReadyForUpload()) {
      if (this.chatService.openNewMsgComponent) {
        this.toggleOpenNewMsgComponent();
        this.chatService.currentChatSection = 'chats';
        this.messagePreperation();
        this.chatService.userReceiverName = '';
      } else {
        this.messagePreperation();
      }
    }
  }

/**
 * Validates the conditions for the new message component before sending a message.
 * If a user hasn't been selected (`selectedValue` is undefined) and the new message 
 * component is open, it highlights the input field and returns false, indicating the message 
 * shouldn't be sent. Otherwise, it returns true.
 * @returns {boolean} - True if conditions to send the message are met, otherwise false.
 */
  validateNewMessageComponentConditions(): boolean {
    if (this.selectedValue === undefined && this.chatService.openNewMsgComponent) {
        this.genFService.highlightInput.next(true);
        return false;
    }
    return true;
}

  textMessageNotEmpty() {
    return this.msgService.messageText.length > 0;
  }


  fileReadyForUpload() {
    return this.uploadService.upload_array.file_name.length > 0;
  }


  toggleOpenNewMsgComponent() {
    this.chatService.openNewMsgComponent = !this.chatService.openNewMsgComponent;
  }


  async messagePreperation() {
    await this.uploadService.checkForUpload();
    setTimeout(async () => {
      await this.msgService.newMessage();
      this.msgService.scrollToBottom('channel')
    }, 400);
    setTimeout(() => this.uploadService.emptyUploadArray(), 500);
  }


  addUserToTextarea(i: number) {
    this.messageTextarea.nativeElement.focus();
    this.msgService.messageText = this.chatService.addUserToTextarea(i, this.msgService.messageText)
  }


  async getAllUsers() {
    this.chatService.at_users = await this.authService.getAllUsers();
  }


  async openChat(chat) {
    if (this.chatService.openNewMsgComponent) this.chatService.openNewMsgComponent = false;
    if (this.notSameChatID(chat)) {
      this.loadChatData(chat);
    }
  }


  loadChatData(chat) {
    this.chatService.currentChatSection = 'chats';
    this.chatService.currentChatID = chat.chat_ID;
    this.msgService.emptyMessageText();
    try {
      this.chatService.currentChatData = chat;
      this.chatService.textAreaMessageTo();
      this.msgService.getMessages();
      this.chatService.thread_open = false;
    } catch (error) {
      console.error("Fehler bei öffnen des Chats: ", error);
    }
  }


  notSameChatID(chat) {
    return this.chatService.currentChatID !== chat.chat_ID;
  }


  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.key === 'Enter' && event.shiftKey) {
        this.msgService.messageText += ' ';
        this.msgService.messageText += '\n';
        this.msgService.messageText += ' ';
      }
    }
  }


  noChatSelected() {
    return this.chatService.currentChatID === 'noChatSelected';
  }


  messageEmpty() {
    return this.msgService.messageText.length !== 0;
  }


  noFileSelected() {
    return this.uploadService.upload_array.file_name.length !== 0;
  }
}
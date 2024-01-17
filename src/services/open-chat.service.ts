import { Injectable } from '@angular/core';
import { ChatService } from './chat.service';
import { MessagesService } from './messages.service';
import { GeneralFunctionsService } from './general-functions.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class OpenChatService {

  constructor(
    public chatService: ChatService,
    public msgService: MessagesService,
    public genFunctService: GeneralFunctionsService,
    public channelService: ChannelService
  ) { }


  /**
  * Opens the chat based on the provided chat ID and section.
  * @param {string} id - The ID of the chat.
  * @param {string} [chatSection='chats'] - The section in which the chat belongs. Defaults to 'chats'.
  */
  async openChat(id: string, chatSection: string = 'chats') {
      this.ensureChatSectionVisible();
    if (this.chatService.currentChatID !== id) {
      this.chatService.currentChatSection = chatSection;
      this.setCurrentID(id);
      await this.getCurrentData();
    }
  }


  /**
  * Checks the window's width and determines if the application should switch to a mobile logo.
  */
  checkChangeToMobileLogo() {
    if (window.innerWidth <= 1000) {
      this.genFunctService.changeMobileLogo = true;
    }
  }


  /**
  * Sets the current chat ID and optionally sets the current channel ID if the section is 'channels'.
  * Additionally, clears the message text.
  * @param {string} id - The ID to be set.
  */
  setCurrentID(id: string) {
    this.chatService.currentChatID = id;
    if (this.chatService.currentChatSection == 'channels') this.channelService.currentChannelID = id;
    this.msgService.emptyMessageText();
  }


  /**
  * Retrieves the current chat data, sets the appropriate messaging area, and loads chat messages.
  * Additionally, ensures the chat section is appropriately displayed.
  */
  async getCurrentData() {
     this.chatService.getCurrentChatData();
     this.chatService.textAreaMessageTo();
    if (this.chatService.currentChatSection == 'channels') this.channelService.loadCurrentChannel();
    this.msgService.getMessages().then(() => {
      this.chatService.thread_open = false;
      this.msgService.scrollToBottom('channel')
    });
  }


  /**
  * Ensures that the chat section is visible and makes adjustments based on the screen size.
  */
  ensureChatSectionVisible() {
    this.checkChangeToMobileLogo();
    this.chatService.open_chat = true
    if (this.chatService.openNewMsgComponent) this.chatService.openNewMsgComponent = false;
  }
}

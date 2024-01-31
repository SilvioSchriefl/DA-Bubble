import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { DialogEditCommentComponent } from '../dialog-edit-comment/dialog-edit-comment.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogDeleteCommentComponent } from '../dialog-delete-comment/dialog-delete-comment.component';
import { EmojiService } from '../../services/emoji.service';
import { MessagesService } from 'services/messages.service';
import { ChatService } from 'services/chat.service';
import { UploadService } from 'services/upload.service';
import { ReactionBubbleService } from 'services/reaction-bubble.service';
import { ProfileService } from 'services/profile.service';
import { ChannelService } from 'services/channel.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss'],
})
export class ThreadComponent implements OnInit {
  @ViewChild('ChatContainerREF') public scrollContainer: ElementRef;
  @ViewChildren('comment') comments: QueryList<ElementRef>;
  @ViewChild('type_message') textarea!: ElementRef;
  @ViewChild('messageTextarea') messageTextarea: ElementRef;
  private scrollSubscription: Subscription;
  emoji_exist: boolean;
  react_user: string = 'test'
  comment_value: string = ''
  picker_index: number
  response: string = 'Antwort'
  channel_message = {
    emoji_data: []
  }
  emoji_data = []
  comment_index: number;
  emoji_index: number;
  hovered_emoji: boolean = false
  edit_comment: boolean = false;
  edit_comment_index: number;
  open_attachment_menu: boolean;
  uploadProgress: number = 0;
  selectedEmoji: string
  emojiPicker_open: boolean = false;
  show_picker_above: boolean
  regex = /[^\n]/;


  constructor(
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public emojiService: EmojiService,
    public dialog: MatDialog,
    public msgService: MessagesService,
    public chatService: ChatService,
    public uploadService: UploadService,
    public reactionBubbleService: ReactionBubbleService,
    public profileService: ProfileService,
    public channelService: ChannelService,
    public genFunctService: GeneralFunctionsService,
  ) { }


  /**
   * Initializes the component with necessary event listeners and data retrieval.
   *
   * @return {Promise<void>} Promise that resolves when initialization is complete
   */
  async ngOnInit(): Promise<void> {
    document.body.addEventListener('click', this.bodyClicked);
    this.fsDataThreadService.getMessages()
    await this.getAllUsers()
    this.scrollSubscription = this.msgService.scrollObservableThread.subscribe(() => {
      this.scrollDivToBottom();
    });
  }



  /**
   * Method called when the component is being destroyed.
   *
   * @return {void} 
   */
  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }


  /**
   * Scrolls the div to the top using smooth behavior.
   */
  scrollDivToTop() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  /**
   * Scrolls the div to the bottom.
   */
  scrollDivToBottom() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTop = scrollContainerElement.scrollHeight;
  }


  /**
   * Closes a thread based on the given value.
   *
   * @param {boolean} value - the value to determine if the thread should be closed
   */
  closeThread(value: boolean) {
    this.chatService.thread_open = false
  }


  /**
   * Open the emoji picker at a specific index and section.
   *
   * @param {number} i - the index of the emoji picker
   * @param {string} section - the section where the emoji picker is being opened
   */
  openEmojiPicker(i: number, section: string) {
    this.show_picker_above = false
    const textAreaRect = this.textarea.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (textAreaRect.bottom > viewportHeight - 427 && section == 'textarea') this.show_picker_above = true
    if (this.comments && section === 'comment') {
      let ArrayEmojiMessagePopupsRef = [];
      this.comments.forEach((popupRef) => {
        ArrayEmojiMessagePopupsRef.push(popupRef);
      });
      let commentRect = ArrayEmojiMessagePopupsRef[i].nativeElement.getBoundingClientRect();
      if (commentRect.top > viewportHeight - 427) this.show_picker_above = true;
    }
    this.picker_index = i
    this.emojiPicker_open = true
  }


  /**
   * Adds an emoji in the specified thread.
   *
   * @param {any} $event - the event triggering the emoji addition
   * @param {number} i - the index of the thread
   */
  addEmojiInThread($event: any, i: number) {
    let array = this.fsDataThreadService.comments
    let user = this.authService.userData.uid
    this.emojiPicker_open = false
    this.fsDataThreadService.comments = this.emojiService.addEmoji($event, i, array, user)
    this.fsDataThreadService.updateData()
  }


  /**
   * Function to add or remove emoji in a thread.
   *
   * @param {number} i - index of the thread
   * @param {number} j - index of the emoji
   */
  addOrRemoveEmojIinThread(i: number, j: number) {
    this.fsDataThreadService.current_changed_index = i
    let array = this.fsDataThreadService.comments
    let user = this.authService.userData.uid
    this.hovered_emoji = false
    this.fsDataThreadService.comments = this.emojiService.addOrRemoveEmoji(i, j, array, user)
    this.fsDataThreadService.updateData()
  }


  bodyClicked = () => {
    if (this.emojiPicker_open == true) this.emojiPicker_open = false;
    if (this.edit_comment == true) this.edit_comment = false;
    if (this.chatService.open_users == true) {
      this.chatService.open_users = false;
      this.getAllUsers()
    }
    if (this.open_attachment_menu == true) this.open_attachment_menu = false
  };


  /**
   * Asynchronously posts a comment. It checks if there are uploaded files and 
   * prepares them for upload. If the comment value is not empty and passes the 
   * check, or there are uploaded files, it saves the thread, scrolls to the 
   * bottom, sets the response based on the number of comments, and empties the 
   * upload array after a delay.
   *
   */
  async postComment() {
    if (this.uploadService.upload_array.file_name.length > 0) await this.uploadService.prepareUploadfiles()
    if (this.comment_value.length > 0 && !this.checkComment(this.comment_value) || this.uploadService.upload_array.file_name.length > 0) {
      this.fsDataThreadService.saveThread(this.commentData()),
        this.msgService.scrollToBottom('thread')
      if (this.fsDataThreadService.comments?.length > 1) this.response = 'Antworten'
      if (this.fsDataThreadService.comments?.length < 2) this.response = 'Antwort'
      setTimeout(() => this.uploadService.emptyUploadArray(), 500);
    }
  }


  /**
   * Generates comment data including comment, modified comment, timestamp, UID, emoji data, text edited status, and uploaded files.
   *
   * @return {Object} comment_data - the generated comment data object
   */
  commentData(): object {
    let time_stamp = new Date()
    let comment_data = {
      comment: this.comment_value,
      modified_comment: this.chatService.modifyMessageValue(this.comment_value),
      time: time_stamp,
      uid: this.authService.getUid(),
      emoji_data: [],
      text_edited: false,
      uploaded_files: this.uploadService.upload_array
    };
    this.comment_value = ''
    return comment_data;
  }


  /**
   * Check the comment for any non-whitespace characters and return the result.
   *
   * @param {string} text - the input text to be checked
   * @return {boolean} true if the input text contains only whitespace, false otherwise
   */
  checkComment(text: string): boolean {
    const cleanedStr = text.replace(/\s/g, '');
    return cleanedStr === '';
  }


  /**
   * addEmojitoTextarea function adds an emoji to the textarea.
   *
   * @param {any} $event - the event object
   */
  addEmojitoTextarea($event: any) {
    let unicodeCode: string = $event.emoji.unified
    let emoji = String.fromCodePoint(parseInt(unicodeCode, 16));
    this.comment_value += emoji
  }


  /**
   * Check if emoji exists in the message and update the count if found.
   *
   * @param {any} $event - the event object
   */
  checkIfEmojiExistinMessage($event: any) {
    if (this.channel_message.emoji_data.length == 0) return
    this.channel_message.emoji_data.forEach(element => {
      if (element.emoji == $event.emoji.colons) {
        element.count += 1
      }
    });
  }


  /**
   * Adds an emoji to the message.
   *
   * @param {any} $event - the event triggering the addition of the emoji
   */
  addEmojiToMessage($event: any) {
    this.emojiPicker_open = false
    this.emoji_exist = false
    this.checkIfEmojiExistinMessage($event)
    if (!this.emoji_exist) {
      let emoji_data = {
        emoji: $event.emoji.colons,
        count: 1,
        react_users: [this.authService.userData.uid]
      }
      this.channel_message.emoji_data.push(emoji_data)
    }
  }


  /**
   * Open the edit comment menu.
   *
   * @param {number} i - the index of the comment to edit
   */
  openEditCommentMenu(i: number) {
    this.edit_comment = true
    this.edit_comment_index = i
  }


  /**
   * Opens a dialog to edit a comment.
   *
   * @param {number} i - the index of the comment to edit
   */
  openEditComment(i: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'edit_comment';
    this.edit_comment = false;
    const dialogRef = this.dialog.open(DialogEditCommentComponent, {
      ...dialogConfig,
      data: { comment: this.fsDataThreadService.comments[i].comment }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fsDataThreadService.comments[i].comment = result;
        this.fsDataThreadService.comments[i].modified_comment = this.chatService.modifyMessageValue(result)
        this.fsDataThreadService.comments[i].text_edited = true
        this.fsDataThreadService.updateData()
      }
    });
  }


  /**
   * Opens the edit comment dialog and updates the chat message if the result is
   * not null.
   */
  openEditMessage() {
    this.edit_comment = false;
    const dialogRef = this.dialog.open(DialogEditCommentComponent, {
      data: { comment: this.fsDataThreadService.current_chat_data.chat_message }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fsDataThreadService.current_chat_data.chat_message = result;
        this.fsDataThreadService.current_chat_data.modified_message = this.chatService.modifyMessageValue(result)
        this.fsDataThreadService.current_chat_data.chat_message_edited = true
        this.msgService.saveEditedMessageFromThread(this.fsDataThreadService.current_chat_data)
      }
    });
  }


  /**
   * Open a dialog to delete a comment.
   *
   * @param {number} i - the index of the comment to be deleted
   */
  openDeleteComment(i: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'delete_comment';
    this.edit_comment = false;
    const dialogRef = this.dialog.open(DialogDeleteCommentComponent, {
      ...dialogConfig,
      data: { comment: this.fsDataThreadService.comments[i].comment },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result || result == '') {
        if (this.checkIfLastAnswer()) this.deleteThread()
        else this.updateThread(i)
      }
    });
  }


  /**
   * Deletes the current thread, including associated messages and chat data.
   */
  deleteThread() {
    this.msgService.deleteMessage(this.fsDataThreadService.direct_chat_index, this.fsDataThreadService.current_chat_data)
    this.fsDataThreadService.deletThread()
    this.chatService.thread_open = false
  }


  /**
   * Update a thread at the specified index.
   *
   * @param {number} i - The index of the thread to update.
   */
  updateThread(i: number) {
    this.fsDataThreadService.comments.splice(i, 1)
    this.fsDataThreadService.fake_array.length = this.fsDataThreadService.comments.length
    this.fsDataThreadService.updateData()
  }


  /**
   * Check if the last answer.
   *
   * @return {boolean} true if last answer, false otherwise
   */
  checkIfLastAnswer(): boolean {
    if (this.fsDataThreadService.current_chat_data.answers == 1 && this.fsDataThreadService.current_chat_data.message_deleted) return true
    else return false
  }


  /**
   * Opens the delete message functionality.
   */
  openDeleteMessage() {
    this.edit_comment = false;
    this.msgService.openDeleteMessage(this.fsDataThreadService.direct_chat_index, this.fsDataThreadService.current_chat_data)
  }


  /**
   * Function to show React users.
   *
   * @param {number} i - The first index
   * @param {number} j - The second index
   */
  showReactUsers(i: number, j: number) {
    if (this.hovered_emoji == false) this.hovered_emoji = true
    this.comment_index = i
    this.emoji_index = j
  }


  /**
   * Closes the show react users and resets the hovered emoji flag if it's true.
   */
  closeShowReactUsers() {
    if (this.hovered_emoji == true) this.hovered_emoji = false
  }


  /**
   * Opens the users and sets a flag to indicate that the users are open.
   */
  openUsers() {
    this.getAllUsers()
    this.chatService.open_users = true
  }


  /**
   * Retrieves the image URL for a user with the given unique identifier.
   *
   * @param {string} uid - The unique identifier of the user
   * @return {string} The URL of the user's avatar image
   */
  getImageUrl(uid: string): string {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.avatar
  }


  /**
   * Retrieves the user name associated with the given UID.
   *
   * @param {string} uid - the unique identifier of the user
   * @return {string} the user name associated with the UID
   */
  getUserName(uid: string) {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.user_name
  }


  /**
   * Retrieves the email of the user with the given UID.
   *
   * @param {string} uid - The unique identifier of the user
   * @return {string} The email of the user
   */
  getUserEmail(uid: string): string {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.email
  }


  /**
   * Opens the attachment menu.
   */
  openAttachmentMenu() {
    this.open_attachment_menu = true
    this.uploadService.chat_section = 'thread'
  }


  /**
   * Function to add or remove emojis on a direct chat message.
   *
   * @param {number} i - the index of the message
   * @param {number} j - the index of the emoji
   */
  addOrRemoveEmojisOnDirectChatMessage(i: number, j: number) {
    this.hovered_emoji = false
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.msgService.emoji_data = this.emojiService.addOrRemoveEmoji(i, j, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(this.fsDataThreadService.current_chat_data);
  }


  /**
   * Adds an emoji in a direct message.
   *
   * @param {any} $event - the event triggering the emoji addition
   * @param {number} i - the index of the chat message
   */
  addEmojiInDirectMessage($event: any, i: number) {
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.emojiPicker_open = false;
    this.msgService.emoji_data = this.emojiService.addEmoji($event, i, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(this.fsDataThreadService.current_chat_data);
  }


  /**
   * Handles the change of the text input.
   *
   * @param {string} text - the new text input
   */
  textChanged(text: string) {
    this.comment_value = this.chatService.textChanged(text)
  }


  /**
   * Adds the user to the textarea at the specified index.
   *
   * @param {number} i - the index where the user should be added
   */
  addUserToTextarea(i: number) {
    this.messageTextarea.nativeElement.focus();
    this.comment_value = this.chatService.addUserToTextarea(i, this.comment_value)
  }


  /**
   * Get all users asynchronously.
   *
   * @return {Promise<void>} The result of getting all users.
   */
  async getAllUsers(): Promise<void> {
    this.chatService.at_users = await this.authService.getAllUsers();
  }


  /**
   * Handles the 'Enter' key event.
   *
   * @param {KeyboardEvent} event - the keyboard event
   */
  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.key === 'Enter' && event.shiftKey) {
        this.comment_value += ' '
        this.comment_value += '\n';
        this.comment_value += ' '
      }
    }
  }


  /**
   * Deletes the upload file with the given filename and k value.
   *
   * @param {string} filename - The name of the file to be deleted
   * @param {number} k - The k value
   */
  deleteUploadFile(filename: string, k: number) {
    this.uploadService.deleteSelectedFile(filename, this.fsDataThreadService.direct_chat_index, k, 'mainChat')
    if (this.fsDataThreadService.current_chat_data.answers == 0 && this.fsDataThreadService.current_chat_data.chat_message == '') this.deleteThread()
  }


  autoFocus() {
    if( this.chatService.thread_open){
      if(this.messageTextarea) this.messageTextarea.nativeElement.focus();
    } 
    else {
    if(this.messageTextarea) this.messageTextarea.nativeElement.blur();
    }
  }
}

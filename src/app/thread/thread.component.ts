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


  async ngOnInit(): Promise<void> {
    document.body.addEventListener('click', this.bodyClicked);
    this.fsDataThreadService.getMessages()
    await this.getAllUsers()
    this.scrollSubscription = this.msgService.scrollObservableThread.subscribe(() => {
      this.scrollDivToBottom();
    });
  }



  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }


  scrollDivToTop() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  scrollDivToBottom() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTop = scrollContainerElement.scrollHeight;
  }


  closeThread(value: boolean) {
    this.chatService.thread_open = false
  }


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


  addEmojiInThread($event: any, i: number) {
    let array = this.fsDataThreadService.comments
    let user = this.authService.userData.uid
    this.emojiPicker_open = false
    this.fsDataThreadService.comments = this.emojiService.addEmoji($event, i, array, user)
    this.fsDataThreadService.updateData()
  }


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


  commentData() {
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


  checkComment(text: string) {
    const cleanedStr = text.replace(/\s/g, '');
    return cleanedStr === '';
  }


  addEmojitoTextarea($event: any) {
    let unicodeCode: string = $event.emoji.unified
    let emoji = String.fromCodePoint(parseInt(unicodeCode, 16));
    this.comment_value += emoji
  }


  checkIfEmojiExistinMessage($event: any) {
    if (this.channel_message.emoji_data.length == 0) return
    this.channel_message.emoji_data.forEach(element => {
      if (element.emoji == $event.emoji.colons) {
        element.count += 1
      }
    });
  }


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


  openEditCommentMenu(i: number) {
    this.edit_comment = true
    this.edit_comment_index = i
  }


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


  deleteThread() {
    this.msgService.deleteMessage(this.fsDataThreadService.direct_chat_index, this.fsDataThreadService.current_chat_data)
    this.fsDataThreadService.deletThread()
    this.chatService.thread_open = false
  }


  updateThread(i: number) {
    this.fsDataThreadService.comments.splice(i, 1)
    this.fsDataThreadService.fake_array.length = this.fsDataThreadService.comments.length
    this.fsDataThreadService.updateData()
  }


  checkIfLastAnswer() {
    if (this.fsDataThreadService.current_chat_data.answers == 1 && this.fsDataThreadService.current_chat_data.message_deleted) return true
    else return false
  }


  openDeleteMessage() {
    this.edit_comment = false;
    this.msgService.openDeleteMessage(this.fsDataThreadService.direct_chat_index, this.fsDataThreadService.current_chat_data)
  }


  showReactUsers(i: number, j: number) {
    if (this.hovered_emoji == false) this.hovered_emoji = true
    this.comment_index = i
    this.emoji_index = j
  }


  closeShowReactUsers() {
    if (this.hovered_emoji == true) this.hovered_emoji = false
  }


  openUsers() {
    this.getAllUsers()
    this.chatService.open_users = true
  }


  getImageUrl(uid: string): string {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.avatar
  }


  getUserName(uid: string) {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.user_name
  }


  getUserEmail(uid: string) {
    const user = this.authService.all_users.find(element => element.uid === uid);
    return user.email
  }


  openAttachmentMenu() {
    this.open_attachment_menu = true
    this.uploadService.chat_section = 'thread'
  }


  addOrRemoveEmojisOnDirectChatMessage(i: number, j: number) {
    this.hovered_emoji = false
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.msgService.emoji_data = this.emojiService.addOrRemoveEmoji(i, j, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(this.fsDataThreadService.current_chat_data);
  }


  addEmojiInDirectMessage($event: any, i: number) {
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.emojiPicker_open = false;
    this.msgService.emoji_data = this.emojiService.addEmoji($event, i, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(this.fsDataThreadService.current_chat_data);
  }


  textChanged(text: string) {
    this.comment_value = this.chatService.textChanged(text)
  }


  addUserToTextarea(i: number) {
    this.messageTextarea.nativeElement.focus();
    this.comment_value = this.chatService.addUserToTextarea(i, this.comment_value)
  }


  async getAllUsers() {
    this.chatService.at_users = await this.authService.getAllUsers();
  }


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


  deleteUploadFile(filename: string, k: number) {
    this.uploadService.deleteSelectedFile(filename, this.fsDataThreadService.direct_chat_index, k, 'mainChat')
    if (this.fsDataThreadService.current_chat_data.answers == 0 && this.fsDataThreadService.current_chat_data.chat_message == '') this.deleteThread()
  }
}

import { Component, ElementRef, EventEmitter, HostListener, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { getFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';
import { EmojiService } from 'services/emoji.service';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { MessagesService } from 'services/messages.service';
import { ProfileService } from 'services/profile.service';
import { ReactionBubbleService } from 'services/reaction-bubble.service';
import { UploadService } from 'services/upload.service';

@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss']
})

export class ChatMessagesComponent {
  db = getFirestore();
  @Output() threadOpen = new EventEmitter<boolean>();
  messageCreator: boolean = false;
  toggleEditMessage: boolean = false;
  @ViewChild('ChatContainerREF') public scrollContainer: ElementRef;
  @ViewChildren('emojiMessagePopupREF') ElementEmojiMessagePopupsRef: QueryList<ElementRef>;
  @ViewChildren('emojiPopupReactionBarREF') ElementEmojiPopupReactionBarRef: QueryList<ElementRef>;
  private scrollSubscription: Subscription;
  hovered_emoji: boolean = false;
  emoji_index: number;
  private mutationObserver: MutationObserver;
  isScrollable: boolean = false;

  constructor(
    public authService: AuthenticationService,
    public fsDataThreadService: FirestoreThreadDataService,
    public chatService: ChatService,
    public msgService: MessagesService,
    public emojiService: EmojiService,
    public reactionBubbleService: ReactionBubbleService,
    public profileService: ProfileService,
    public uploadService: UploadService,
    public genFunctService: GeneralFunctionsService,
  ) { }


  ngOnInit(): void {
    this.scrollSubscription = this.msgService.scrollObservable.subscribe(() => {
      this.scrollDivToBottom();
    });
  }


  ngAfterViewInit() {
    this.observeDivChanges();
  }


  private observeDivChanges() {
    if (this.scrollContainer) {
      const nativeElement = this.scrollContainer.nativeElement;
      const observerConfig = { childList: true, subtree: true };
      this.mutationObserver = new MutationObserver(() => {
        this.checkForScroll();
      });
      this.mutationObserver.observe(nativeElement, observerConfig);
    }
  }

  
  checkForScroll() {
    if (this.scrollContainer) {
      const nativeElement = this.scrollContainer.nativeElement;
      const isScrollable = nativeElement.scrollHeight > nativeElement.clientHeight;
      if (this.isScrollable !== isScrollable) {
        this.isScrollable = isScrollable;
      }
    } else {
      this.isScrollable = false;
    }
  }


  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }


  scrollDivToBottom() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: scrollContainerElement.scrollHeight,
      behavior: 'smooth'
    });
  }


  scrollDivToTop() {
    const scrollContainerElement = this.scrollContainer.nativeElement;
    scrollContainerElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const emojiPickerReactionBar = target.closest('.emojiPickerReactionBar');
    const emojiPickerDirect = target.closest('.emojiPickerDirect');
    const emojiPickerMessage = target.closest('.emojiPickerMessage');
    const emojiPickerMessageEdit = target.closest('.emojiPickerMessageEdit');
    const toggleEditMessage = target.closest('.toggleEditMessage');
    if (!emojiPickerReactionBar) this.emojiService.picker_reaction_bar = false;
    if (!emojiPickerDirect && !emojiPickerMessage && !emojiPickerMessageEdit) this.emojiService.emojiPicker_open = false;
    if (!toggleEditMessage) this.toggleEditMessage = false;
  }


  togglePopup(popupVariable: string) {
    popupVariable === 'toggleEditMessage' ? this.toggleLocalVar() : this.toggleServiceVar(popupVariable);
  }


  toggleLocalVar() {
    this.toggleEditMessage = !this.toggleEditMessage;
  }

  toggleServiceVar(popupVariable) {
    this.emojiService[popupVariable] = !this.emojiService[popupVariable];
    if (this.emojiService[popupVariable]) this.closeOtherPopups(popupVariable);
  }


  closeOtherPopups(currentPopup: string) {
    const popupVariables = ['picker_reaction_bar', 'emojiPicker_open'];
    popupVariables.forEach(popup => {
      if (popup !== currentPopup) this.emojiService[popup] = false;
    });
  }

  isMessageCreator(user_Sender_ID) {
    const currentUserID = this.authService.userData.uid
    if (currentUserID) {
      return user_Sender_ID === currentUserID;
    } else {
      return false;
    }
  }


  addEmojiInMessage($event: any, i: number, chatMessage) {
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.emojiService.emojiPicker_open = false;
    this.emojiService.picker_reaction_bar = false;
    this.msgService.emoji_data = this.emojiService.addEmoji($event, i, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(chatMessage);
  }


  addOrRemoveEmojiClickEmojis(i: number, j: number, chatMessage) {
    let chatMessages = this.chatService.directChatMessages;
    let user = this.authService.userData.uid;
    this.msgService.emoji_data = this.emojiService.addOrRemoveEmoji(i, j, chatMessages, user)[i]['emoji_data'];
    this.msgService.updateMessagesReactions(chatMessage);
  }


  showReactUsers(i: number, j: number) {
    if (this.hovered_emoji == false) this.hovered_emoji = true
    this.emoji_index = j
  }


  closeShowReactUsers() {
    if (this.hovered_emoji == true) this.hovered_emoji = false
  }


  public openThread(value: boolean) {
    this.threadOpen.emit(value)
  }


  showPlaceholder() {
    return this.chatService.directChatMessages.length === 0 && this.chatService.currentChatSection === 'chats' && this.msgService.messagesLoaded;
  }
}

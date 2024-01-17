import { Injectable } from '@angular/core';
import { doc, getFirestore, updateDoc, collection, orderBy, query, deleteDoc, getDoc, onSnapshot, setDoc, DocumentData, Query, DocumentChange } from '@angular/fire/firestore';
import { ChatService } from './chat.service';
import { AuthenticationService } from './authentication.service';
import { EmojiService } from './emoji.service';
import { Subject } from 'rxjs/internal/Subject';
import { GeneralFunctionsService } from './general-functions.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteCommentComponent } from 'app/dialog-delete-comment/dialog-delete-comment.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  db = getFirestore();
  previousMessageDate = null;
  messageText: string = '';
  messageID: string = '';
  editMessageText = false;
  readyToSend: boolean = false;
  messageDateRange: string = '';
  emoji_data = [];
  messageIndex: number = null;
  private scrollSubject = new Subject<void>();
  private scrollSubjectThread = new Subject<void>();
  answers_count: any;
  time: any;
  upload_array: any;
  messagesLoaded: boolean = false;
  private chatSnapshotUnsubscribe: () => void;


  constructor(
    public dialog: MatDialog,
    public chatService: ChatService,
    public authService: AuthenticationService,
    public emojiService: EmojiService,
    public genFunctService: GeneralFunctionsService,
  ) { }


  
  /**
   * Checks if the messageText is not empty and if the currentChatID is not equal to 'noChatSelected'
   * or if the openNewMsgComponent flag is true. Sets the readyToSend flag accordingly.
   */
  checkIfEmpty()  {
    if (this.messageText.length > 0 && this.chatService.currentChatID !== 'noChatSelected' || this.chatService.openNewMsgComponent) {
      this.readyToSend = true;
    } else {
      this.readyToSend = false;
    }
  }


  /**
   * Asynchronously creates a new message.
   *
   * @return {Promise<void>} A promise that resolves when the new message is created.
   */
  async newMessage(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      let time_stamp = new Date();
      const customMessageID = await this.genFunctService.generateCustomFirestoreID();
      await setDoc(doc(collection(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages'), customMessageID),
        this.newMessageData(time_stamp, customMessageID)
      ).then(() => {
        this.messageText = '';
      });
      resolve();
    });
  }


  /**
   * Generates a new message data object.
   *
   * @param {Date} time_stamp - The timestamp of the message.
   * @param {string} customMessageID - The custom ID of the message.
   * @return {Object} - The newly generated message data object.
   */
  newMessageData(time_stamp: Date, customMessageID: string): object {
    return {
      chat_message: this.messageText,
      user_Sender_ID: this.authService.userData.uid,
      user_Sender_Name: this.authService.userData.user_name,
      created_At: time_stamp,
      chat_message_edited: false,
      emoji_data: [],
      modified_message: this.chatService.modifyMessageValue(this.messageText),
      answers: 0,
      last_answer: '',
      uploaded_files: this.upload_array,
      message_ID: customMessageID
    }
  }


  /**
   * Save the number of answers for a given ID.
   *
   * @param {string} id - The ID for which to save the number of answers.
   * @return {Promise<void>} A promise that resolves when the number of answers is saved.
   */
  async saveNumberOfAnswers(id: string): Promise<void> {
    await this.getNumberOfAnswers(id)
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', id);
    const data = {
      answers: this.answers_count,
      last_answer: this.time
    };
    updateDoc(messageRef, data);
  }


  /**
   * Retrieves the number of answers for a given id.
   *
   * @param {string} id - The id of the thread.
   * @return {Promise<void>} - Returns a Promise that resolves to undefined.
   */
  async getNumberOfAnswers(id: string): Promise<void> {
    const docRef = doc(this.db, "threads", id);
    const docSnap = await getDoc(docRef);
    this.answers_count = docSnap.data().comments.length
    if (this.answers_count > 0) this.time = docSnap.data().comments[this.answers_count - 1].time.seconds
    else this.time = 0
  }


 
  /**
   * Retrieves messages from the server and subscribes to changes.
   *
   * @return {Promise<void>} A promise that resolves when the messages are loaded.
   */
  async getMessages(): Promise<void> {
    try {
      this.prepareForGetMessages();
      let docChatMessagesSnapshot = this.getChatMessagesSnapshot();
      this.chatSnapshotUnsubscribe = onSnapshot(docChatMessagesSnapshot, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          this.reactToChange(change);
        });
        this.messagesLoaded = true;
      });
      await new Promise<void>((resolve) => {
        resolve();
      });
    } catch (error) {
      console.error("Fehler beim Laden der Nachrichten:", error);
    }
  }


  /**
   * Prepares the chat for retrieving messages.
   */
  prepareForGetMessages() {
    if (this.chatSnapshotUnsubscribe) this.chatSnapshotUnsubscribe();
    this.messagesLoaded = false;
    this.emojiService.resetInitializedEmojiRef();
    this.chatService.directChatMessages = [];
  }


  /**
   * Retrieves a snapshot of chat messages.
   *
   * @return {Query} The query object for retrieving chat messages.
   */
  getChatMessagesSnapshot(): Query {
    const chatMessagesRef = collection(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages');
    return query(chatMessagesRef, orderBy("created_At", "asc"));
  }


/**
 * Reacts to a change in the document.
 *
 * @param {DocumentChange<DocumentData>} change - The change in the document.
 */
  reactToChange(change: DocumentChange<DocumentData>) {
    const changedMessageData = change.doc.data();
    if (change.type === 'added') this.chatService.directChatMessages.push(changedMessageData);
    else if (change.type === 'modified') this.getChangedMessage(changedMessageData);
    else if (change.type === 'removed') this.spliceMessage(changedMessageData);
  }


  /**
   * Retrieves the changed chat message based on the provided changed message data.
   *
   * @param {DocumentData} changedMessageData - The data of the changed message.
   */
  async getChangedMessage(changedMessageData: DocumentData) {
    let changedChatMessage = this.chatService.directChatMessages.find(chatMessage => chatMessage.message_ID === changedMessageData.message_ID);
    for (const variable in changedMessageData) {
      if (changedMessageData.hasOwnProperty(variable)) {
        changedChatMessage[variable] = changedMessageData[variable];
      }
    }
  }


  /**
   * Remove a chat message from the direct chat messages array if it matches the given message ID.
   *
   * @param {DocumentData} changedMessageData - The changed message data object.
   */
  async spliceMessage(changedMessageData: DocumentData) {
    const index = this.chatService.directChatMessages.findIndex(chatMessage => chatMessage.message_ID === changedMessageData.message_ID);
    if (index !== -1) {
      this.chatService.directChatMessages.splice(index, 1);
    }
  }


  /**
   * Scrolls to the bottom of the specified section.
   *
   * @param {string} section - The section to scroll to the bottom of.
   */
  scrollToBottom(section: string) {
    if (section == 'thread') setTimeout(() => this.scrollSubjectThread.next(), 0);
    else setTimeout(() => this.scrollSubject.next(), 0);
  }


  /**
   * Returns an observable that emits scroll events.
   *
   * @return {Observable} The scroll observable.
   */
  get scrollObservable(): Observable<void> {
    return this.scrollSubject.asObservable();
  }


  /**
   * Returns an observable for the scroll events of the thread.
   *
   * @return {Observable} The scroll events observable for the thread.
   */
  get scrollObservableThread(): Observable<void> {
    return this.scrollSubjectThread.asObservable();
  }


  /**
   * Edits a message at a specific index with new content.
   *
   * @param {number} i - the index of the message to be edited
   * @param {{ message_ID: string; chat_message: string; }} chatMessage - an object containing the message ID and the new content of the message
   */
  async editMessage(i: number, chatMessage: { message_ID: string; chat_message: string; }) {
    this.messageIndex = i;
    this.messageID = chatMessage.message_ID;
    this.editMessageText = true;
    this.messageText = chatMessage.chat_message;
  }


  /**
   * Saves the edited message.
   *
   * @return {Promise<void>} - A promise that resolves when the message is successfully edited.
   */
  async saveEditedMessage(): Promise<void> {
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await updateDoc(messageRef,
        this.editedMessageData(this.messageText, true, this.chatService.modifyMessageValue(this.messageText))
      ).then(() => {
        this.messageText = '';
        this.editMessageText = false;
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }


  /**
   * Saves an edited message from a thread.
   *
   * @param {Object} chat - The chat object containing the message details.
   *   - {any} message_ID - The ID of the message.
   *   - {any} chat_message - The original message.
   *   - {any} chat_message_edited - The edited message.
   *   - {any} modified_message - The modified message.
   * @return {Promise<void>} A promise that resolves when the message is updated.
   */
  async saveEditedMessageFromThread(chat: { message_ID: any; chat_message: any; chat_message_edited: any; modified_message: any; }): Promise<void> {
    let id = chat.message_ID;
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', id);
    await updateDoc(messageRef,
      this.editedMessageData(chat.chat_message, chat.chat_message_edited, chat.modified_message)
    )
  }


  /**
   * Returns an object containing the edited message data.
   *
   * @param {string} chatMessage - The original chat message.
   * @param {boolean} chatMessageEdited - Indicates whether the chat message was edited.
   * @param {string[]} modifiedMessage - The modified message.
   * @return {object} The edited message data.
   */
  editedMessageData(chatMessage: string, chatMessageEdited: boolean, modifiedMessage: string[]): object {
    return {
      chat_message: chatMessage,
      chat_message_edited: chatMessageEdited,
      modified_message: modifiedMessage,
    }
  }


  /**
   * Deletes a message from the chat.
   *
   * @param {number} i - The index of the message in the chat.
   * @param {Object} chatMessage - The chat message object containing the message details.
   * @param {any} chatMessage.chat_message - The message content.
   * @param {number} chatMessage.answers - The number of answers associated with the message.
   * @param {any} chatMessage.message_ID - The ID of the message.
   * @return {Promise<void>} A promise that resolves once the message is deleted.
   */
  async deleteMessage(i: number, chatMessage: { chat_message?: any; answers?: number; message_ID?: any; }): Promise<void> {
    this.messageIndex = i;
    this.messageID = chatMessage.message_ID;
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await deleteDoc(messageRef)
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }


/**
 * Opens a dialog to delete a chat message and updates the message accordingly.
 *
 * @param {number} i - The index of the chat message.
 * @param {Object} chatMessage - The chat message object containing the message and answer count.
 */
  openDeleteMessage(i: number, chatMessage: { chat_message: any; answers: number; }) {
    const dialogRef = this.dialog.open(DialogDeleteCommentComponent, {
      data: { comment: chatMessage.chat_message },
      panelClass: 'my-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result || result == '') {
        chatMessage.chat_message = result;
        if (chatMessage.answers == 0) {
          this.deleteMessage(i, chatMessage)
          this.chatService.thread_open = false
        }
        else this.changeMessageToDeleted(chatMessage)
      }
    });
  }


  
  /**
   * Change the chat message to "Diese Nachricht wurde gelöscht."
   * and mark the message as deleted.
   *
   * @param {Object} chatMessage - The chat message object
   * @param {string} chatMessage.chat_message - The original chat message
   * @param {number} [chatMessage.answers] - The number of answers to the message
   * @param {string} [chatMessage.message_ID] - The ID of the message
   * @return {Promise<void>} A promise that resolves when the message is updated
   */
  async changeMessageToDeleted(chatMessage: { chat_message: string; answers?: number; message_ID?: string; }): Promise<void> {
    chatMessage.chat_message = 'Diese Nachricht wurde gelöscht.'
    const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', chatMessage.message_ID);
    await updateDoc(messageRef, {
      chat_message: chatMessage.chat_message,
      message_deleted: true
    })
  }


  /**
   * Returns a formatted time string in the format "HH:MM Uhr" based on the given timestamp.
   *
   * @param {Object} timestamp - An object representing a timestamp.
   * @param {Function} timestamp.toDate - A function that returns a Date object.
   * @return {string} - The formatted time string.
   */
  getTimestampTime(timestamp: { toDate: () => any; }): string {
    const dateObj = timestamp.toDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Uhr`;
  }


  /**
   * Updates the reactions of a chat message.
   *
   * @param {Object} chatMessage - An object containing the message ID.
   * @param {string} chatMessage.message_ID - The ID of the message to update the reactions for.
   * @return {Promise<void>} A promise that resolves once the reactions are updated.
   */
  async updateMessagesReactions(chatMessage: { message_ID: string; }): Promise<void> {
    const docRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', chatMessage.message_ID);
    await updateDoc(docRef, {
      emoji_data: this.emoji_data,
    });
  }


/**
 * Formats a timestamp into a string representing the date.
 *
 * @param {Object} timestamp - The timestamp object to format.
 * @return {string} The formatted date string.
 */
  formatDate(timestamp: { toDate: () => any; }): string {
    const date = timestamp.toDate();
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return 'Heute';
    } else {
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      return date.toLocaleDateString('de-DE', options);
    }
  }


  /**
   * Sets the `messageText` property to an empty string.
   */
  emptyMessageText()  {
    this.messageText = '';
  }


  /**
   * Updates the uploaded files in the chat service for a specific direct chat message.
   *
   * @param {number} i - The index of the direct chat message in the chat service.
   * @param {number} k - The index of the file to be removed from the uploaded files array.
   */
  updateUploadedFiles(i: number, k: number) {
    this.chatService.directChatMessages[i].uploaded_files.file_name.splice(k, 1);
    this.chatService.directChatMessages[i].uploaded_files.download_link.splice(k, 1);
    this.messageID = this.chatService.directChatMessages[i].message_ID;
    this.saveEditedUploads(i);
  }


  /**
   * Saves the edited uploads for a specific chat message.
   *
   * @param {number} i - The index of the chat message in the directChatMessages array.
   * @return {Promise<void>} A promise that resolves when the uploads are successfully saved.
   */
  async saveEditedUploads(i: number): Promise<void> {
    let message = this.chatService.directChatMessages[i]
    try {
      const messageRef = doc(this.db, this.chatService.currentChatSection, this.chatService.currentChatID, 'messages', this.messageID);
      await updateDoc(messageRef, {
        uploaded_files: this.chatService.directChatMessages[i].uploaded_files,
      })
      if (message.uploaded_files.file_name.length == 0 && message.chat_message == '' && message.answers == 0) this.deleteMessage(i, message)
      if (message.answers > 0 && message.uploaded_files.file_name.length == 0 && message.chat_message == '') this.changeMessageToDeleted(message)
    } catch (error) {
      console.error('Error updating files:', error);
    }
  }
}

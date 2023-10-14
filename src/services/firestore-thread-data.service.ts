import { Injectable } from '@angular/core';
import { deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { getFirestore, collection } from "firebase/firestore";
import { AuthenticationService } from './authentication.service';
import { ChatService } from './chat.service';
import { MessagesService } from './messages.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FirestoreThreadDataService {
  db = getFirestore();
  dbRef_thread = collection(this.db, "threads");
  dbRef_message = collection(this.db, "channel_messages");
  channel_messages = [];
  current_message: any;
  current_message_id: string;
  comments: any[] = []
  detailsVisible: boolean = false;
  chat_user: string
  subscription: Subscription | undefined;
  current_changed_index: number
  fake_array = []
  chat_type: string;
  current_chat_data: any;
  direct_chat_index: number;
  current_channelname: any;
  window_width = window.innerWidth


  constructor(
    public authenticationService: AuthenticationService,
    private chatService: ChatService,
    private messageSevice: MessagesService,
  ) { }


  /**
   * saves changed content from the thread and scrolls the page downwards
   * 
   * @param comments data 
   */
  async saveThread(data) {
    this.comments.push(data)
    const docRef = doc(this.db, "threads", this.current_message_id);
    await updateDoc(docRef, {
      comments: this.comments
    });
    if (this.chat_type == 'direct') this.messageSevice.saveNumberOfAnswers(this.current_message_id)
    this.messageSevice.scrollToBottom('thread')
  }


  /**
   * updates the comments in the thread and saves the number of comments
   */
  async updateData() {
    const docRef = doc(this.db, "threads", this.current_message_id);
    await updateDoc(docRef, {
      comments: this.comments
    });
    if (this.chat_type == 'direct') this.messageSevice.saveNumberOfAnswers(this.current_message_id)
  }


  /**
   * retrieves the messages from the backend
   */
  async getMessages() {
    this.channel_messages = []
    const colRef = collection(this.db, "channel_messages");
    const docsSnap = await getDocs(colRef);
    docsSnap.forEach(doc => {
      this.channel_messages.push(doc.data());
    })
  }


  /**
   * open the thread component ang get the message id
   * 
   * @param i 
   */
  async openThread(i: number) {
    this.chat_type = 'channel'
    this.chatService.thread_open = true
    this.current_message = this.channel_messages[i].message
    this.validateIdFromMessage(i);
  }


  /**
   * open the thread component ang get the message id
   * 
   * @param i index
   */
  openDirectChatThread(i: number) {
    this.chatService.thread_open = true
    if (this.window_width < 1300 && this.window_width > 1000) {
      if (this.chatService.sidebarVisible) this.chatService.sidebarVisible = false
    }
    this.current_channelname = this.chatService.currentChatData.channelName
    this.current_chat_data = this.chatService.directChatMessages[i]
    this.direct_chat_index = i
    this.current_message = this.chatService.directChatMessages[i].modified_message
    this.current_message_id = this.chatService.directChatMessages[i].message_ID
    this.loadThread(this.current_message_id).then(() => {
      this.chat_type = 'direct'
      this.messageSevice.scrollToBottom('thread')
    });
  }


  /**
   * get the message id
   * 
   * @param i index
   */
  validateIdFromMessage(i: number) {
    this.current_message_id = this.channel_messages[i].id
    this.loadThread(this.current_message_id)
  }


  /**
   * 
   * @param timestamp current time
   * @returns the time elapsed since the post
   */
  getTimeSince(timestamp: number) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const timeDifference = nowInSeconds - timestamp;
    const seconds = timeDifference % 60;
    const minutes = Math.floor((timeDifference / 60) % 60);
    const hours = Math.floor((timeDifference / 3600) % 24);
    const days = Math.floor(timeDifference / 86400);
    if (days > 1) return `vor ${days} Tagen`;
    else if (days == 1) return `vor ${days} Tag`;
    else if (hours == 1) return `vor ${hours} Stunde`;
    else if (hours > 1) return `vor ${hours} Stunden`;
    else if (minutes > 1) return ` vor ${minutes} Minuten `;
    else if (minutes == 1) return ` vor ${minutes} Minute `;
    else return `gerade eben`;
  }


  /**
   * loads the thread data from the backend
   * 
   * @param documentId 
   * @returns promise
   */
  async loadThread(documentId: string): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const docRef = doc(this.db, 'threads', documentId);
      onSnapshot(doc(this.db, "threads", documentId), async (doc) => {
        const changedData = doc.data();
        if (changedData) {
          this.comments = changedData.comments;
          this.fake_array.length = this.comments.length;
        } else {
          let thread_data = { comments: [] }
          await setDoc(docRef, thread_data);
        }
        resolve();
      });
    });
  }


  /**
   * delete the thraed date in the backend
   */
  async deletThread() {
    const docRef = doc(this.db, 'threads', this.current_message_id);
    await deleteDoc(docRef);
  }


  /**
   * updates the comment data in the backend
   * 
   * @param i index comments
   * @param k index upload file
   */
  updateThread(i: number, k: number) {
    this.comments[i].uploaded_files.file_name.splice(k, 1);
    this.comments[i].uploaded_files.download_link.splice(k, 1);
    this.updateData();
  }


  /**
   * highlights the "@user" in the comment
   * 
   * @param user name 
   * @returns highlighted "@username"
   */
  formatNameAndText(name: string): string {
    const [firstName, lastName] = name.split(' ');
    const formattedName = `<span class="highlighted">@${firstName} ${lastName}</span>`;
    return `${formattedName} `;
  }
}

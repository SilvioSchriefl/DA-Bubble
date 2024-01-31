import { Injectable } from '@angular/core';
import { doc, getFirestore, collection, getDocs, getDoc, onSnapshot, setDoc, DocumentData } from '@angular/fire/firestore';
import { AuthenticationService } from './authentication.service';
import { ChannelService } from './channel.service';
import { GeneralFunctionsService } from './general-functions.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  db = getFirestore();
  open_chat: boolean = false
  at_users: any
  currentChatSection = 'noChatSectionSelected';
  currentChatID: string = 'noChatSelected';
  directChatMessages = [];
  currentChatData: DocumentData;
  messageToPlaceholder: string = 'Nachricht an ...';
  chats: any[] = [];
  currentUser_id: string
  open_users: boolean = false;
  userReceiverID: string;
  userReceiverName: string;
  thread_open: boolean = false
  openNewMsgComponent: boolean = false;
  directedFromProfileButton: boolean = false;
  sidebarVisible: boolean = true;
  timeoutSidebarHide: boolean = false;
  toggleSidebarMenuText: string = 'Workspace-Menü schließen';

  constructor(
    public authService: AuthenticationService,
    public channelService: ChannelService,
    public genFunctService: GeneralFunctionsService,
  ) { }


  /**
   * Asynchronously loads chats from the database and updates the local chats array.
   *
   * @return {Promise<void>} A Promise that resolves when the chats are loaded
   */
  async loadChats(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.chats = [];
      const querySnapshot = collection(this.db, 'chats');
      onSnapshot(querySnapshot, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const chatData = change.doc.data();
          const isDataAlreadyInChats = this.chats.some(chat => JSON.stringify(chat) === JSON.stringify(chatData));
          if (change.type === 'added' && this.isUserChat(chatData) && !isDataAlreadyInChats) this.chats.push(chatData);
        });
        resolve();
      });
    });
  }


  /**
   * Check if the user is part of the chat.
   *
   * @param {DocumentData} chatData - the chat data to be checked
   * @return {boolean} true if the user is part of the chat, false otherwise
   */
  isUserChat(chatData: DocumentData): boolean {
    return chatData.chat_Member_IDs.includes(this.currentUser_id);
  }


  /**
   * Initializes own chat for the current user.
   *
   * @return {Promise<void>} 
   */
  async initOwnChat(): Promise<void> {
    const userID = this.currentUser_id;
    let chatExists = false;
    if (this.chats.length != 0) {
      this.chats.forEach((chat) => {
        if (chat.chat_Member_IDs[0] === userID && chat.chat_Member_IDs[1] === userID) {
          chatExists = true;
        }
      });
    }
    if (!chatExists) await this.newChat(userID);
  }


  /**
   * Asynchronously searches for a chat using the user receiver ID.
   *
   * @param {string} userReceiverID - the ID of the user receiving the chat
   * @return {Promise<string | null>} the ID of the found chat, or null if not found
   */
  async searchChat(userReceiverID: string): Promise<string | null> {
    let foundChatId = null;
    if (this.authService.getUid() !== null) {
      try {
        const docChatsSnapshot = await getDocs(collection(this.db, 'chats'));
        docChatsSnapshot.forEach((chat) => {
          const chatData = chat.data();
          if (this.exactChatMemberIDs(chatData, userReceiverID)) {
            foundChatId = chatData.chat_ID;
          }
        });
        return foundChatId;
      } catch (error) {
        console.error("Fehler bei der Suche nach einem Chat: ", error);
      }
    } else console.error("Kein Benutzer ist eingeloggt");
    return null;
  }
  


  /**
   * Checks if the given userReceiverID is an exact chat member
   *
   * @param {DocumentData} chatData - the chat data containing member IDs
   * @param {string} userReceiverID - the ID of the user to check
   * @return {boolean} true if the userReceiverID is an exact chat member, false otherwise
   */
  exactChatMemberIDs(chatData: DocumentData, userReceiverID: string): boolean {
    const sortedMemberIDs = chatData.chat_Member_IDs.slice().sort();
    return (sortedMemberIDs[0] === userReceiverID && sortedMemberIDs[1] === this.authService.getUid()) ||
      (sortedMemberIDs[1] === userReceiverID && sortedMemberIDs[0] === this.authService.getUid());
  }


  /**
   * Retrieves the chat document from the database if the current chat ID is set,
   * otherwise returns null.
   *
   * @return {object | null} The chat document data if it exists, otherwise null
   */
  async getChatDocument(): Promise<object> {
    if (this.currentChatID) {
      const docRef = doc(this.db, 'chats', this.currentChatID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } else {
      return null;
    }
  }


  /**
   * Creates a new chat for the user with the given receiver ID.
   *
   * @param {string} userReceiverID - the ID of the user who will receive the chat
   * @return {Promise<string | null>} A promise that resolves with the custom chat ID
   * if the chat is successfully created, or null if there is an error
   */
  async newChat(userReceiverID: string): Promise<string | null> {
    const userID = this.currentUser_id;
    this.directChatMessages = [];
    return new Promise(async (resolve, reject) => {
      try {
        const time_stamp = new Date();
        const customChatID = await this.genFunctService.generateCustomFirestoreID();
        await setDoc(doc(collection(this.db, 'chats'), customChatID), {
          chat_Member_IDs: [userID, userReceiverID],
          created_At: time_stamp,
          chat_ID: customChatID
        });
        resolve(customChatID);
      } catch (error) {
        console.error("Error beim Erstellen eines neuen Chats: ", error);
        reject(error);
      }
    });
  }


  /**
   * Set the messageToPlaceholder based on the current chat section.
   */
  textAreaMessageTo() {
    if (this.currentChatSection === 'chats') {
      this.messageToPlaceholder = 'Nachricht an ' + this.getChatReceiverUser(this.currentChatData).user_name;
    } else if (this.currentChatSection === 'channels') {
      this.messageToPlaceholder = 'Nachricht an ' + this.currentChatData.channelName;
    } else {
      this.messageToPlaceholder = 'Nachricht an ...';
    }
  }


  getChatReceiverUser(chat: DocumentData) {
    let chatReveiverID: string;
    try {
      if (!chat || chat.channelName) return null;
      if (chat.chat_Member_IDs[0] !== this.currentUser_id) chatReveiverID = chat.chat_Member_IDs[0];
      else chatReveiverID = chat.chat_Member_IDs[1];
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten beim Verarbeiten des Chats:", chat);
    }
    const user = this.authService.all_users.find(user => user.uid === chatReveiverID);
    return user;
  }


  /**
   * Retrieves the current chat data based on the current chat section and ID.
   */
  getCurrentChatData() {
    if (this.currentChatSection === 'channels') {
      this.currentChatData = this.channelService.channels.find(channel => channel.channel_ID === this.currentChatID);
    } else if (this.currentChatSection === 'chats') {
      this.currentChatData = this.chats.find(chat => chat.chat_ID === this.currentChatID);
    }
  }
  

  /**
   * Modifies the message value by replacing any words starting with '@' with the corresponding user ID from authService.all_users.
   *
   * @param {string} message - the original message to be modified
   * @return {string[]} the modified message as an array of words
   */
  modifyMessageValue(message: string): string[] {
    const words = message.split(' ')
    for (let i = 0; i < words.length; i++) {
      let word1 = words[i];
      let word2 = words[i + 1]
      if (word1.startsWith('@')) {
        let word_without_at = word1.substring(1);
        for (let j = 0; j < this.authService.all_users.length; j++) {
          const [firstName, lastName] = this.authService.all_users[j].user_name.split(' ');
          const formattedName = this.authService.all_users[j].uid
          if (lastName && lastName == word2) {
            words[i] = formattedName
            words.splice(i + 1, 1)
          }
          if (firstName == word_without_at && !lastName) words[i] = formattedName
        }
      }
    }
    return words
  }


  /**
   * Handles the change of the input text and searches for users if the word starts with '@'.
   *
   * @param {string} text - the input text
   * @return {string} the modified text after processing
   */
  textChanged(text: string): string {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.startsWith('@')) {
        if (i === words.length - 1) {
          this.searchUserByLetter(word);
        }
      }
      if (word.length == 0) this.open_users = false;
    }
    return words.join(' ')
  }


  /**
   * Asynchronously search for a user by a specific letter in the user name.
   *
   * @param {string} word - the word to search for
   */
  async searchUserByLetter(word: string) {
    this.open_users = true;
    const word_without_at = word.substring(1);
    const filterValue = word_without_at.toLowerCase();
    const filteredUsers = this.authService.all_users.filter(element =>
      element.user_name.toLowerCase().startsWith(filterValue)
    );
    const filteredAndProcessedUsers = filteredUsers.map(user => {
      return {
        ...user,
        word: word
      };
    });
    this.at_users = filteredAndProcessedUsers;
  }


  /**
   * Adds the user's username to the textarea at a specific index.
   *
   * @param {number} i - the index of the user in the at_users array
   * @param {string} text - the text to modify
   * @return {string} the modified text with the added username
   */
  addUserToTextarea(i: number, text: string): string {
    const search_word = this.at_users[i].word;
    const words = text.split(' ');
    let index = words.indexOf(search_word);
    words[index] = '';
    text = words.join(' ');
    text += ' ' + '@' + this.at_users[i].user_name;
    return text;
  }


  /**
   * Checks if a word is an ID.
   *
   * @param {string} word - the word to be checked
   * @return {boolean} true if the word is an ID, false otherwise
   */
  checkIfWordIsAnId(word: string): boolean {
    if (word.includes('\n')) word = word.replace(/\n/, '');
    const user = this.authService.all_users.find(element => element.uid === word);
    if (user) return true
    else return false
  }


  /**
   * A function that renames the user ID to the user's username.
   *
   * @param {string} word - the user ID to be renamed
   * @return {string} the username if the user ID is found, otherwise the original user ID
   */
  renameUid(word: string): string {
    const user = this.authService.all_users.find(element => element.uid === word);
    if (user) return '@' + user.user_name
    else return word
  }


  /**
   * Check if the input word contains a line break character.
   *
   * @param {string} word - the word to check for line break
   * @return {boolean} true if the word contains a line break, false otherwise
   */
  checkForBreak(word: string): boolean {
    if (word.includes('\n')) return true
    else return false
  }


  /**
   * Toggles the sidebar visibility and updates the displayed text accordingly.
   */
  toggleSidebar() {
    if (this.sidebarVisible) {
      this.sidebarVisible = false;
      this.changeText('Workspace-Menü öffnen');
    } else {
      this.sidebarVisible = true
      this.changeText('Workspace-Menü schließen');
      if (window.innerWidth < 1500 && this.thread_open == true) this.thread_open = false
    }
  }


  /**
   * Changes the text of the sidebar menu.
   *
   * @param {string} text - the new text for the sidebar menu
   */
  changeText(text: string) {
    this.toggleSidebarMenuText = text;
  }
}

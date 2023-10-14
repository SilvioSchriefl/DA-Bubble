import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, arrayUnion, updateDoc, collection, addDoc, query, where, getDocs, doc, getDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { GeneralFunctionsService } from './general-functions.service';


@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  db = getFirestore();
  auth = getAuth();

  public authorizedChannelsSubject = new BehaviorSubject<any[]>([]);
  authorizedChannels = this.authorizedChannelsSubject.asObservable();

  private createdChannelId = new BehaviorSubject<string>(undefined);
  createdChannelId$: Observable<string> = this.createdChannelId.asObservable();

  currentChannelID: string = 'noChannelSelected';
  currentChannelData: any;
  channels: any[] = [];


  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public generalFuncttions: GeneralFunctionsService,
  ) {
    const dbRef = collection(this.db, "channels");
    onSnapshot(dbRef, docsSnap => {
      const channels: any[] = []
      docsSnap.forEach(doc => {
        channels.push(doc.data())
      })
      this.channels = channels;
      this.loadCurrentChannel()
      const user = this.auth.currentUser;
      if (user !== null) {
        this.getAuthorizedChannels(user.uid);
      }
    });
  }


  /**
  * Sets the ID of the recently created channel.
  * @param {string} newValue - The new channel ID.
  */
  setCreatedChannelId(newValue: string) {
    this.createdChannelId.next(newValue);
  }


  /**
  * Retrieves all members associated with a specific channel.
  * @param {string} channelName - The name of the channel.
  * @returns {Promise<string[]>} A promise resolving to an array of user IDs.
  */
  async getAllMembersOfCertainChannel(channelName: string): Promise<string[]> {
    const channelRef = doc(this.db, 'channels', channelName);
    const channelSnapshot = await getDoc(channelRef);
    if (channelSnapshot.exists()) {
      const channelData = channelSnapshot.data();
      const assignedUsers = channelData?.assignedUsers || [];
      return assignedUsers;
    } else {
      console.log(`Channel with name ${channelName} does not exist.`);
      return [];
    }
  }


  /**
  * Creates a new channel with the specified name and description.
  * @param {string} channel - The name of the new channel.
  * @param {string} [description] - An optional description for the channel.
  */
  async createNewChannel(channel: string, description?: string) {
    const user = this.auth.currentUser;
    if (user !== null) {
      try {
        const channelCollectionRef = await addDoc(collection(this.db, 'channels'), {
          channelName: channel,
          createdBy: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          assignedUsers: [user.uid,],
          description: description
        });
        const newChannelID = channelCollectionRef.id;
        await updateDoc(channelCollectionRef, {
          channel_ID: newChannelID
        });
        this.setCreatedChannelId(channelCollectionRef.id)
      } catch (error) {
        console.error("Error beim Erstellen eines neuen Channels: ", error);
      }
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
  }


  /**
  * Fetches channels the user is authorized to view based on their UID.
  * @param {string} uid - The user's UID.
  */
  async getAuthorizedChannels(uid: string) {
    const allDocuments = query(collection(this.db, 'channels'), where('assignedUsers', 'array-contains', uid));
    const querySnapshot = await getDocs(allDocuments);
    const channels: any[] = [];
    querySnapshot.forEach((doc) => {
      channels.push(doc.data());
    });
    this.channels = channels;
  }


  /**
  * Retrieves channels the user is a part of.
  * @param {string} uid - The user's UID.
  * @returns {Promise<any[]>} A promise resolving to an array of channel data.
  */
  async getChannels(uid: string) {
    const allDocuments = query(collection(this.db, 'channels'), where('assignedUsers', 'array-contains', uid));
    const querySnapshot = await getDocs(allDocuments);
    const channels: any[] = [];
    querySnapshot.forEach((doc) => {
      channels.push(doc.data());
    });
    return channels;
  }


  /**
  * Looks for a user in the database by their name.
  * @param {string} name - The user's name.
  * @returns {Promise<string|null>} A promise resolving to the user's UID or null if not found.
  */
  async findUserByName(name: string): Promise<string | null> {
    const usersSnapshot = await getDocs(query(collection(this.db, 'users'), where('user_name', '==', name)));
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      return userDoc.data().uid;
    }
    return null;
  }


  /**
  * Adds a user to a specified channel by updating the 'assignedUsers' array.
  * @param {string} channelName - The name of the channel.
  * @param {string} id - The user's UID.
  */
  async addUserToChannel(channelName: string, id: string) {
    const channelSnapshot = await getDocs(query(collection(this.db, 'channels'), where('channelName', '==', channelName)));
    if (!channelSnapshot.empty) {
      const channelDoc = channelSnapshot.docs[0];
      await updateDoc(channelDoc.ref, {
        assignedUsers: arrayUnion(id)
      });
    } else {
      console.error(`Kein Channel gefunden mit dem Namen: ${channelName}`);
    }
  }


  /**
  * Updates specific properties of a channel document.
  * @param {any} currentChatData - The current chat data object.
  * @param {any} changes - An object containing properties to update.
  */
  async updateChannelInfo(currentChatData, changes) {
    const auth = getAuth();
    const user = auth.currentUser;
    try {
      const channelDocRef = doc(this.db, 'channels', currentChatData.channel_ID);
      await updateDoc(channelDocRef, changes);
      this.getAuthorizedChannels(user.uid);
    } catch (error) {
      console.error("Error beim Erstellen eines neuen Channels: ", error);
    }
  }


  /**
  * Deletes a channel and its associated messages.
  * @param {string} channelId - The ID of the channel to delete.
  */
  async deleteChannel(channelId: string) {
    const subcollectionRef = collection(this.db, 'channels', channelId, 'messages');
    const subcollectionQuery = query(subcollectionRef);
    const subcollectionDocs = await getDocs(subcollectionQuery);
    const deleteSubcollectionPromises = subcollectionDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteSubcollectionPromises);
    const documentRef = doc(this.db, 'channels', channelId);
    await deleteDoc(documentRef);
    this.loadStandardChannel();
  }


  /**
  * Sets the ID of the default channel.
  */
  loadStandardChannel() {
    this.setCreatedChannelId('RRraQrPndWV95cqAWCZR');
  }


  /**
  * Loads the current channel data based on the current channel ID.
  */
  loadCurrentChannel() {
    let channel = this.channels.find(element => element.channel_ID === this.currentChannelID)
    if (channel) this.currentChannelData = channel
  }
}

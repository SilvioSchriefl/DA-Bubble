import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { doc, getDoc, getFirestore, updateDoc, getDocs, onSnapshot, DocumentData } from '@angular/fire/firestore';
import { collection } from '@firebase/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ChannelService } from './channel.service';
import { User, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private authInitializedPromise: Promise<void>;
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private auth = getAuth();
  db = getFirestore();
  userData: any = [];
  signIn_successful: boolean
  signIn_error: boolean
  email_error: boolean
  signUp_successful: boolean
  userName: string
  email_send: boolean = null;
  googleUser_exist: boolean;
  all_users: any[];
  usersPromise: Promise<any>;
  newUser: boolean = false

  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    private router: Router,
    public channelService: ChannelService,
  ) {
    this.setCurrentUserToLocalStorage();
    this.loadAllUsers();
    this.loadCurrentUser();
  }

/**
 * saves the user data in local storage
 */
  setCurrentUserToLocalStorage() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        setTimeout(() => this.getUserData(user.uid), 500);
        this.channelService.getAuthorizedChannels(user.uid);
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        localStorage.setItem('user', 'null');
      }
    });
  }


  /**
   * loads all registered users from the backend
   */
  loadAllUsers() {
    this.usersPromise = new Promise<void>((resolve) => {
      const dbRef = collection(this.db, "users");
      onSnapshot(dbRef, docsSnap => {
        const users: any[] = [];
        docsSnap.forEach(doc => {
          users.push(doc.data())
        })
        this.all_users = users;
        resolve();
      });
    });
  }


  /**
   * loads the data of the logged in user
   */
  loadCurrentUser() {
    this.authInitializedPromise = new Promise<void>((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUserSubject.next(user);
        resolve();
      });
    });
  }


  /**
   * 
   * @returns returned true when authentication is fully loaded
   */
  async waitUntilAuthInitialized(): Promise<void> {
    return this.authInitializedPromise;
  }


  /**
   * 
   * @returns logged user id
   */
  getUid() {
    const auth = getAuth();
    const user = auth.currentUser;
    return user.uid;
  }


  /**
   * loads the data of the logged in user
   * 
   * @param uid logged user id
   */
  async getUserData(uid: string) {
    const userRef = doc(this.db, "users", uid);
    let docSnap = await getDoc(userRef);
    this.userData = docSnap.data()
  }



  /**
   * creates a user account with email and password in the backend
   * 
   * @paramu user email from signup component
   * @param user password  from signup component
   */
  async SignUp(email: string, password: string) {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      await this.SetUserData(result.user);
      this.signUp_successful = true;
      setTimeout(() => (this.signUp_successful = false), 3000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        this.email_error = true
        setTimeout(() => this.email_error = false, 3000);
      } else
        window.alert(error.message)
    }
  }


  /**
   * logs the user in with email and password
   * 
   * @param user email from sign in component
   * @param user password from sign in component
   */
  async SignIn(email: string, password: string) {
    try {
      const result = await this.afAuth
        .signInWithEmailAndPassword(email, password)
      this.signIn_successful = true
      this.setOnlineStatus(email, 'Aktiv')
      setTimeout(() => this.signIn_successful = false, 3000);
    } catch (error) {
      this.signIn_error = true
      setTimeout(() => this.signIn_error = false, 3000);
    }
  }


  /**
   * logs the user in as a guest
   */
  async guestSignIn() {
    try {
      const result = await this.afAuth
        .signInWithEmailAndPassword('gast@gast.de', 'Amidala6%')
      this.signIn_successful = true
      this.setOnlineStatus('gast@gast.de', 'Aktiv')
      setTimeout(() => this.signIn_successful = false, 3000);
      this.channelService.loadStandardChannel()
    } catch (error) {
      this.signIn_error = true
      setTimeout(() => this.signIn_error = false, 3000);
    }
  }


  /**
   * sets the online status
   * 
   * @param current user email 
   * @param current user status 
   */
  async setOnlineStatus(email: string, status: string) {
    const user = this.all_users.find(element => element.email === email);
    const userRef = doc(this.db, 'users', user.uid);
    await updateDoc(userRef, {
      status: status
    });
  }



  async GoogleAuth() {
    await this.AuthLogin(new GoogleAuthProvider());
  }


  /**
   * Logs the user in with their Google account
   * 
   * @param provider Google
   */
  async AuthLogin(provider: firebase.auth.AuthProvider | GoogleAuthProvider) {
    try {
      const result = await this.afAuth.signInWithPopup(provider);
      this.userName = result.user.displayName;
      await this.isEmailRegistered(result.user.email, result.user)
      this.signIn_successful = true;
      setTimeout(() => this.signIn_successful = false, 3000);
    } catch (error) {
      window.alert(error.message);
    }
  }


  /**
   * checks whether the user already has an account
   * 
   * @param current user email 
   * @paramc current user 
   */
  async isEmailRegistered(email: string, user: firebase.User) {
    (await this.getAllUsers()).forEach(element => {
      if (element.email == email) {
        this.googleUser_exist = true
        this.setOnlineStatus(email, 'Aktiv')
        this.channelService.loadStandardChannel()
        return
      }
    });
    if (this.googleUser_exist != true) await this.SetUserData(user);
  }


  /**
   * sends an email to reset the password
   * 
   * @param user email
   */
  async ForgotPassword(passwordResetEmail: string) {
    await this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        this.email_send = true
        setTimeout(() => this.email_send = null, 3000);
      })
      .catch((error) => {
        this.email_send = false
        setTimeout(() => this.email_send = null, 3000);
      });
  }


  /**
   * adds the user to the “Development Team” channel and sets user data in the backend
   * 
   * @param current user 
   */
  async SetUserData(user: any) {
    await this.channelService.addUserToChannel('Entwicklerteam', user.uid)
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userDataFirestore = {
      uid: user.uid,
      email: user.email,
      user_name: this.userName,
      avatar: '/assets/img/big_avatar/81. Profile.png',
      status: 'Aktiv'
    };
    await userRef.set(userDataFirestore, {
      merge: true,
    });
    this.getUserData(user.uid)
  }


  /**
   * logs the user out
   */
  async signOut() {
    await this.setOnlineStatus(this.userData.email, 'Abwesend')
    await this.afAuth.signOut();
    localStorage.removeItem('user');
    this.router.navigateByUrl('/sign-in');
    this.userData = []
  }


  /**
   * 
   * @returns  all registered users
   */
  async getAllUsers() {
    const usersSnapshot = await getDocs(collection(this.db, 'users'));
    let users = [];
    usersSnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  }


  /**
   * 
   * @param user id 
   * @returns current user
   */
  getUserInfo(uid: string) {
    const user = this.all_users.find(user => user.uid === uid);
    return user;
  }


  /**
   * sorts all users by name, replaces the first letter with a lowercase letter and returns this
   * 
   * @param user name 
   * @returns filtered users
   */
  async filterUsers(name: string): Promise<any[]> {
    const users = await this.getAllUsers();
    const filteredUser = users.filter(user => user.user_name?.toLowerCase().startsWith(name?.toLowerCase())
    );
    return filteredUser;
  }


  /**
   * sorts all users by name, replaces the first letter with a lowercase letter and returns this
   * 
   * @param user email 
   * @returns filtered users
   */
  async filterUsersByEmail(email: string): Promise<any> {
    const users = await this.getAllUsers();
    const filteredUser = users.filter(user => user.email?.toLowerCase().startsWith(email?.toLowerCase())
    );
    return filteredUser;
  }


  /**
   * 
   * @returns all user without current user
   */
  async usersWithoutCurrentuser() {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex(user => user.user_name === this.userData.user_name);
    if (userIndex !== -1) users.splice(userIndex, 1);
    return users
  }


  /**
   * updates the user data in the backend
   * 
   * @param current user name 
   * @param current user email 
   */
  async updateUserDetails(userName: string, email: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user !== null) {
      const userRef = doc(this.db, 'users', user.uid);
      await updateDoc(userRef, {
        user_name: userName,
        email: email
      });
      this.userData.user_name = userName;
      this.userData.email = email;
    } else {
      console.error("Kein Benutzer ist eingeloggt");
    }
  }


  /**
   * updates the avatar image in the backend
   * 
   * @param avatar image 
   */
  async setAvatarImage(image: string) {
    const docRef = doc(this.db, "users", this.getUid());
    await updateDoc(docRef, {
      avatar: image
    });
    this.getUserData(this.getUid())
  }


  /**
   * 
   * @param current user id 
   * @returns download link of the avatar image
   */
  getImageUrl(uid: string) {
    const user = this.all_users.find(element => element.uid === uid);
    if (user) return user.avatar;
    // else console.log("User not found" + uid);
  }


  /**
   * checks whether a user is logged in
   * 
   * @param user 
   * @returns true or false
   */
  isCurrentUser(user): boolean {
    return user === this.userData.uid ? true : false;
  }
}

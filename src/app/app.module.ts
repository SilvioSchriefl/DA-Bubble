import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { ReactiveFormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from 'services/authentication.service';
// Components
import { NewPasswordComponent } from './new-password/new-password.component';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { MainComponent } from './main/main.component';
import { ChannelDirectChatComponent } from './channel-direct-chat/channel-direct-chat.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { DesktopHeaderComponent } from './desktop-header/desktop-header.component';
import { ChannelSidebarComponent } from './channel-sidebar/channel-sidebar.component';
import { AddChannelComponent } from './dialog-add-channel/add-channel.component';
import { DialogEditChannelComponent } from './dialog-edit-channel/dialog-edit-channel.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { DialogEditMembersComponent } from './dialog-edit-members/dialog-edit-members.component';
import { DialogAddMembersComponent } from './dialog-add-members/dialog-add-members.component';
import { AddPplToChannelComponent } from './dialog-add-ppl-to-channel/add-ppl-to-channel.component';
import { NewMsgComponent } from './new-msg/new-msg.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { DialogDeleteCommentComponent } from './dialog-delete-comment/dialog-delete-comment.component';
import { ChannelDirectEditMessageComponent } from './channel-direct-edit-message/channel-direct-edit-message.component';
import { DialogProfileComponent } from './dialog-profile/dialog-profile.component';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';
import { ThreadComponent } from './thread/thread.component';
import { DialogEditCommentComponent } from './dialog-edit-comment/dialog-edit-comment.component';
import { ChannelDirectSendMessageComponent } from './channel-direct-send-message/channel-direct-send-message.component';
import { ChatMessagesComponent } from './chat-messages/chat-messages.component';
import { ChatPlaceholderComponent } from './chat-placeholder/chat-placeholder.component';
import { HeaderChannelDirectChatComponent } from './header-channel-direct-chat/header-channel-direct-chat.component';
import { ImprintComponent } from './imprint/imprint.component';
import { DataProtectionComponent } from './data-protection/data-protection.component';
import { EmptyChatPlaceholderComponent } from './empty-chat-placeholder/empty-chat-placeholder.component';
// Material API imports
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    ChooseAvatarComponent,
    AppComponent,
    StartScreenComponent,
    MainComponent,
    ChannelDirectChatComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    DesktopHeaderComponent,
    ChannelSidebarComponent,
    AddChannelComponent,
    DialogEditChannelComponent,
    ProfileMenuComponent,
    NewMsgComponent,
    DialogEditMembersComponent,
    DialogAddMembersComponent,
    AddPplToChannelComponent,
    NewPasswordComponent,
    ChannelDirectSendMessageComponent,
    ThreadComponent,
    DialogEditCommentComponent,
    SearchbarComponent,
    DialogDeleteCommentComponent,
    ChannelDirectEditMessageComponent,
    DialogProfileComponent,
    ChatMessagesComponent,
    ChatPlaceholderComponent,
    HeaderChannelDirectChatComponent,
    ImprintComponent,
    DataProtectionComponent,
    EmptyChatPlaceholderComponent,
  ],
  imports: [
    HttpClientModule,
    AngularFireStorageModule,
    MatInputModule,
    MatTooltipModule,
    EmojiComponent,
    PickerComponent,
    FormsModule,
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    MatCardModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    AuthenticationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

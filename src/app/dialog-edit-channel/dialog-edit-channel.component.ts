import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogAddMembersComponent } from 'app/dialog-add-members/dialog-add-members.component';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { ChatService } from 'services/chat.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { MessagesService } from 'services/messages.service';
import { ProfileService } from 'services/profile.service';
import { UploadService } from 'services/upload.service';

@Component({
  selector: 'app-dialog-edit-channel',
  templateUrl: './dialog-edit-channel.component.html',
  styleUrls: ['./dialog-edit-channel.component.scss']
})
export class DialogEditChannelComponent implements OnInit {
  editChannelName: string = 'Bearbeiten';
  editChannelDescription: string = 'Bearbeiten';
  editChannelNameMobile: string = 'edit';
  editChannelDescriptionMobile: string = 'edit';
  editChannelUsers: boolean = false;
  editName: boolean = false;
  editDescription: boolean = false;
  channelName: string = 'Entwicklerteam';
  channelDescription: string = 'Dieser Channel ist für alles rund um #Entwicklerteam-Thema vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.';
  creatorName: string = '';
  assignedUsers = [];
  delete_Channel: boolean = false
  leave_Channel: boolean = false;
  windowWidth: number;

  constructor(
    public authService: AuthenticationService,
    public chatService: ChatService,
    public channelService: ChannelService,
    public uploadService: UploadService,
    public messageService: MessagesService,
    public profileService: ProfileService,
    public genFunctService: GeneralFunctionsService,
    private dialogRef: MatDialogRef<DialogAddMembersComponent>,
  ) { }


  async ngOnInit() {
    this.channelName = this.chatService.currentChatData.channelName;
    this.channelDescription = this.chatService.currentChatData.description;
    this.assignedUsers = this.chatService.currentChatData.assignedUsers;
    this.getCreatorName();
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.windowWidth = event.target.innerWidth;
    if (this.windowWidth > 1000) {
      this.genFunctService.isMobileScreen = false;
    } else {
      this.genFunctService.isMobileScreen = true;
    }
  }


  getCreatorName() {
    const userData = this.authService.all_users.find(user => user.uid === this.chatService.currentChatData.createdBy);
    this.creatorName = userData.user_name;
  }


  toggleLeaveText() {
    this.leave_Channel = !this.leave_Channel;
  }


  async leaveChannel() {
    if (this.assignedUsers.includes(this.authService.userData.uid)) {
      await this.sendLeaveMessage()
      this.editChannelUsers = !this.editChannelUsers;
      this.assignedUsers = this.arrayRemoveItem(this.assignedUsers, this.authService.userData.uid);
      this.saveEditChannelInfo()
      this.chatService.currentChatSection = 'noChatSectionSelected';
      this.chatService.currentChatID = 'noChatSelected';
    }
  }


  arrayRemoveItem(array, value) {
    return array.filter(item => item !== value);
  }


  changeEditText(section) {
    this.saveEditChannelInfo();
    if (section === 'name') {
      this.toggleChannelEditSafe('editName', 'editChannelName', 'editChannelNameMobile')
    } else if (section === 'description') {
      this.toggleChannelEditSafe('editDescription', 'editChannelDescription', 'editChannelDescriptionMobile')
    }
  }


  toggleChannelEditSafe(sectionVar, sectionEditSafe, sectionEditSafeMobile) {
    this[sectionVar] = !this[sectionVar];
    if (this[sectionVar]) {
      this[sectionEditSafe] = 'Speichern';
      this[sectionEditSafeMobile] = 'check_circle'
    } else {
      this[sectionEditSafe] = 'Bearbeiten';
      this[sectionEditSafeMobile] = 'edit'
    }
  }


  saveEditChannelInfo() {
    if (this.editName || this.editDescription || this.editChannelUsers) {
      const changes = this.getChannelChanges();
      this.applyChannelChanges(changes);
      this.channelService.updateChannelInfo(this.chatService.currentChatData, changes);
    }
  }


  getChannelChanges() {
    return {
      channelName: this.channelName,
      description: this.channelDescription,
      assignedUsers: this.assignedUsers
    }
  }


  applyChannelChanges(changes) {
    this.chatService.currentChatData.channelName = changes.channelName;
    this.chatService.currentChatData.description = changes.description;
    this.chatService.currentChatData.assignedUsers = changes.assignedUsers;
  }


  async deleteChannel() {
    this.channelService.deleteChannel(this.chatService.currentChatData.channel_ID);
    this.chatService.currentChatSection = 'noChatSectionSelected';
  }


  openDeleteText() {
    this.delete_Channel = !this.delete_Channel;
  }


  abortDelete() {
    this.delete_Channel = !this.delete_Channel;
  }

  async sendLeaveMessage() {
    this.uploadService.checkForUpload();
    this.messageService.messageText = this.authService.userData.user_name + ' hat #' + this.channelService.currentChannelData.channelName + ' verlassen.';
    await this.messageService.newMessage();
  }

  closeRedirectAddMember() {
    this.dialogRef.close(true);
  }
}

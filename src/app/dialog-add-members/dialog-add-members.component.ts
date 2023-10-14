import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { ChannelService } from 'services/channel.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatService } from 'services/chat.service';
import { MessagesService } from 'services/messages.service';
import { UploadService } from 'services/upload.service';

@Component({
  selector: 'app-dialog-add-members',
  templateUrl: './dialog-add-members.component.html',
  styleUrls: ['./dialog-add-members.component.scss']
})
export class DialogAddMembersComponent implements OnInit {
  inputSearchUser: string = '';
  userAlreadyAdded: boolean = false;
  selectedUsers = [];
  users: any[] = [];
  filteredUsers: any
  loading: boolean = true;

  constructor(
    private authService: AuthenticationService,
    public channelService: ChannelService,
    public dialogRef: MatDialogRef<DialogAddMembersComponent>,
    public chatService: ChatService,
    public messageService: MessagesService,
    public uploadService: UploadService
  ) { }


  async ngOnInit(): Promise<void> {
    this.users = await this.filterAlreadyAssignedUsers()
    this.filterUsers()
    this.loading = false;
  }


  filterUsers() {
    this.userAlreadyAdded = false;
    if (this.inputSearchUser.length > 0) {
      this.filteredUsers = this.users.filter(user =>
        user.user_name.toLowerCase().startsWith(this.inputSearchUser.toLowerCase())
      );
    } else this.filteredUsers = this.users;
  }


  selectUser(user) {
    if (this.inputSearchUser.length > 0 && !this.selectedUsers.includes(user)) {
      this.userAlreadyAdded = false;
      this.selectedUsers.push(user);
      this.inputSearchUser = '';
    } else this.userAlreadyAdded = true;
  }


  async addNewMember() {
    this.inputSearchUser = '';
    this.dialogRef.close();
    for (let user of this.selectedUsers) {
      await this.channelService.addUserToChannel(this.chatService.currentChatData.channelName, user.uid);
      await this.sendAddMemberMessage(user.user_name);
      this.messageService.scrollToBottom('channel');
    }
    this.selectedUsers = [];
  }


  removeSelectedUser(userToRemove) {
    this.selectedUsers = this.selectedUsers.filter(user => user.uid !== userToRemove.uid);
  }


  async filterAlreadyAssignedUsers(): Promise<any> {
    let users = await this.authService.getAllUsers();
    this.channelService.currentChannelData.assignedUsers.forEach((assignedUser: any) => {
      let user = users.find(element => element.uid === assignedUser)
      let index = users.indexOf(user)
      users.splice(index, 1)
    });
    return users
  }


  async sendAddMemberMessage(user: string) {
    await this.uploadService.checkForUpload()
    this.messageService.messageText = user + ' ist #' + this.channelService.currentChannelData.channelName + ' beigetreten.'
    await this.messageService.newMessage()
  }
}

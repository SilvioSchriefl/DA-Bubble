import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { DialogEditMembersComponent } from '../dialog-edit-members/dialog-edit-members.component';
import { DialogAddMembersComponent } from '../dialog-add-members/dialog-add-members.component';
import { AuthenticationService } from 'services/authentication.service';
import { ChatService } from 'services/chat.service';
import { ProfileService } from 'services/profile.service';
import { ChannelService } from 'services/channel.service';
import { GeneralFunctionsService } from 'services/general-functions.service';

@Component({
  selector: 'app-header-channel-direct-chat',
  templateUrl: './header-channel-direct-chat.component.html',
  styleUrls: ['./header-channel-direct-chat.component.scss']
})
export class HeaderChannelDirectChatComponent {

  isEditChannelDialogOpen: boolean = false;
  isEditMembersDialogOpen: boolean = false;
  isAddMembersDialogOpen: boolean = false;
  @ViewChild('editMembersREF') public ElementEditMembersRef: ElementRef<HTMLDivElement>;
  @ViewChild('addMembersREF') public ElementAddMembersRef: ElementRef;
  @ViewChild('editChannelRef', { read: ElementRef }) targetDiv: ElementRef;
  dialogEditChannelRef: MatDialogRef<DialogEditChannelComponent>;
  dialogEditMembersRef: MatDialogRef<DialogEditMembersComponent>;
  dialogAddMembersRef: MatDialogRef<DialogAddMembersComponent>;
  windowWidth: number;

  constructor(
    private dialog: MatDialog,
    public authService: AuthenticationService,
    public chatService: ChatService,
    public profileService: ProfileService,
    public channelService: ChannelService,
    public genFunctService: GeneralFunctionsService
  ) {
    this.windowWidth = window.innerWidth;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.windowWidth = event.target.innerWidth;
  }


  editChannel() {
    if (this.windowWidth >= 1000) {
      this.genFunctService.isMobileScreen = false;
    } else if (this.windowWidth < 1000) {
      this.genFunctService.isMobileScreen = true;
    }
    this.openEditChannel()
  }


  openEditChannel() {
    const targetDiv = this.targetDiv.nativeElement;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-edit-channel-dialog';
    const targetRect = targetDiv.getBoundingClientRect();
    const offsetX = window.scrollX || document.documentElement.scrollLeft;
    const offsetY = window.scrollY || document.documentElement.scrollTop;
    dialogConfig.position = {
      top: targetRect.top + 42 + offsetY + 'px',
      left: targetRect.left + offsetX + 'px',
    };
    this.dialogEditChannelRef = this.dialog.open(DialogEditChannelComponent, dialogConfig);
    this.isEditChannelDialogOpen = true;
    this.dialogEditChannelRef.afterClosed().subscribe(() => {
      this.isEditChannelDialogOpen = false;
    });
  }


  editMembers() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-edit-members-dialog';
    this.dialogEditMembersRef = this.dialog.open(DialogEditMembersComponent, dialogConfig);
    this.isEditMembersDialogOpen = true;
    this.dialogEditMembersRef.afterClosed().subscribe((closedWithRedirection: boolean) => {
      if (closedWithRedirection && window.innerWidth > 1000) {
        this.dialogEditMembersRef = null;
        this.addMembers();
      }
      if (closedWithRedirection && window.innerWidth < 1000) {
        this.dialogEditMembersRef = null;
        this.addMembersMobile();
      }
      this.isEditMembersDialogOpen = false;
    });
  }


  addMembersMobile() {
    const rect = this.ElementAddMembersRef.nativeElement.getBoundingClientRect();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-add-members-dialog';
    this.dialogAddMembersRef = this.dialog.open(DialogAddMembersComponent, dialogConfig);
    this.isAddMembersDialogOpen = true;
    this.dialogAddMembersRef.afterClosed().subscribe(() => {
      this.isAddMembersDialogOpen = false;
    });
  }


  addMembers() {
    if (this.windowWidth > 1000) {
      const rect = this.ElementAddMembersRef.nativeElement.getBoundingClientRect();
      const dialogConfig = new MatDialogConfig();
      dialogConfig.panelClass = 'custom-add-members-dialog';
      this.dialogAddMembersRef = this.dialog.open(DialogAddMembersComponent, dialogConfig);
      this.isAddMembersDialogOpen = true;
      this.dialogAddMembersRef.afterClosed().subscribe(() => {
        this.isAddMembersDialogOpen = false;
      });
    }
    else this.editMembers()
  }


  closeChat() {
    this.chatService.open_chat = false
  }
}

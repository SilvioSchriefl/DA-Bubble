import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddPplToChannelComponent } from '../dialog-add-ppl-to-channel/add-ppl-to-channel.component';
import { FormGroup, FormControl } from '@angular/forms';
import { ChannelService } from 'services/channel.service';

@Component({
  selector: 'app-add-channel',
  templateUrl: './add-channel.component.html',
  styleUrls: ['./add-channel.component.scss']
})
export class AddChannelComponent {
  error: boolean = false
  addPPlRef: MatDialogRef<AddPplToChannelComponent>;
  addPplOpen: boolean = false;
  form = new FormGroup({
    'channel-name': new FormControl(''),
    'description': new FormControl('')
  });
  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService
  ) { }

  /**
  * This method first retrieves the channel name and description from the form, 
  * configures the dialog's properties, and then 
  * initializes the dialog. It also sets listeners for when the dialog is closed.
  */
  openAddPplToChannel() {
    const channelName = this.form.controls['channel-name'].value;
    const description = this.form.controls['description'].value;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '710px'
    dialogConfig.panelClass = 'dialog-add-people';
    dialogConfig.data = { channelName: channelName, description: description };
    this.dialog.closeAll();
    this.addPPlRef = this.dialog.open(AddPplToChannelComponent, dialogConfig);
    this.addPplOpen = true;
    this.addPPlRef.afterClosed().subscribe(() => {
      this.addPplOpen = false;
    });
  }

  /**
  * Checks if the provided channel name already exists. If it doesn't, 
  * it opens the "Add People to Channel" dialog. If it does, toggles the error state.
  */
  checkIfChannelNameExist() {
    let channelName = this.form.controls['channel-name'].value;
    let name = this.channelService.channels.find(name => name.channelName === channelName)
    if (!name) this.openAddPplToChannel()
    else this.error = !this.error
  }

  /**
  * Closes all open dialogs.
  */
  closeDialog() {
    this.dialog.closeAll();
  }
}

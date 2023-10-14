import { Component, HostListener } from '@angular/core';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';
import { ChatService } from 'services/chat.service';
import { GeneralFunctionsService } from 'services/general-functions.service';
import { MessagesService } from 'services/messages.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  open_thread: boolean;
  windowWidth: number;

  constructor(
    public chatService: ChatService,
    public fsDataThreadService: FirestoreThreadDataService,
    public genFunctService: GeneralFunctionsService,
    public messageService: MessagesService
  ) { }


  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth < 1500 && this.chatService.thread_open == true) this.chatService.sidebarVisible = false;
  }


  setVariable(value: boolean) {
    this.open_thread = value;
  }
}

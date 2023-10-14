import { Component } from "@angular/core";
import { ChatService } from "services/chat.service";
import { MessagesService } from "services/messages.service";

@Component({
  selector: 'app-channel-direct-chat',
  templateUrl: './channel-direct-chat.component.html',
  styleUrls: ['./channel-direct-chat.component.scss']
})

export class ChannelDirectChatComponent {
  constructor(
    public chatService: ChatService,
    public msgService: MessagesService,
  ) {}
}

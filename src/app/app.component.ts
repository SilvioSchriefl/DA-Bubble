import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { InactivityService } from 'services/inactivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DABubble';


  constructor(private inactivityService: InactivityService,
    private authService: AuthenticationService) { }


  ngOnInit(): void {
    this.inactivityService.startMonitoring();
    this.inactivityService.inactivityObservable.subscribe(() => {
    this.authService.signOut()
    });
  }
}

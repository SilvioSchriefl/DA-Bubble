import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreThreadDataService } from 'services/firestore-thread-data.service';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {

  animationStart: boolean = false
  animationLogo: boolean = false
  d_none: boolean = false
  active: boolean = false

  constructor(
    public route: ActivatedRoute,
    private firestoreService: AuthenticationService,
    public router: Router,
    public fsDataThreadService: FirestoreThreadDataService,
    public authenticationService: AuthenticationService,
  ) { }


  /**
   * set timeouts for animations and redirects to sign-in
   */
  ngOnInit(): void {
    setTimeout(() => this.animationStart = true, 1000);
    setTimeout(() => this.animationLogo = true, 2500);
    setTimeout(() => this.d_none = true, 3500);
    this.router.navigateByUrl('/sign-in')
  }
}

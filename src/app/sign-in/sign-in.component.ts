import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { Router } from '@angular/router';
import { ChannelService } from 'services/channel.service';
import { MessagesService } from 'services/messages.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  regexEmail = new RegExp('^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$');
  email: string
  emailFocus: boolean = false
  emailError: boolean = false
  password: string = ''
  form_valid: boolean = false

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router,
    public channelService: ChannelService,
    public messageService: MessagesService
  ) { }


  /**
   * logs the user in with googlaccount. If it is a new user, he will be redirected to the choose-avatar component
   */
  async signIn() {
    await this.authenticationService.GoogleAuth()
    if (this.authenticationService.signIn_successful) {
      if (this.authenticationService.googleUser_exist) {
        setTimeout(() => this.router.navigateByUrl('/main'), 1900);
      }
      else setTimeout(() => this.router.navigateByUrl('/choose-avatar'), 1900);
    }
  }


  /**
   * logs the user in with email and password and redirct to the main component.
   */
  async signInWithPassword() {
    if (this.password.length > 7 && this.emailError && !this.authenticationService.signIn_error) {
      await this.authenticationService.SignIn(this.email, this.password)
      if (this.authenticationService.signIn_successful) setTimeout(() => this.router.navigateByUrl('/main'), 1900);
    }
  }



  /**
   * logs the user as a guest in
   */
  guestLogin() {
    this.authenticationService.guestSignIn()
    setTimeout(() => this.router.navigateByUrl('/main'), 1900);
  }


  /**
   * checks whether it is a valid email
   * 
   * @param value text from inputfield
   */
  dataChanged(value: string) {
    this.emailError = this.regexEmail.test(value)
  }
}

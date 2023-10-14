import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  constructor(public authenticationService: AuthenticationService) { }

  email: string
  emailFocus: boolean
  email_valid: boolean
  regexEmail = new RegExp('^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$');
  message: string


  /**
  * checks whether it is a valid email
  */
  dataChanged(value: string) {
    this.email_valid = this.regexEmail.test(value)
  }


  /**
   * sends the password reset email and sends a notification to the user
   */
  async sendMail() {
    if (this.authenticationService.email_send == null) {
      if (this.email_valid) await this.authenticationService.ForgotPassword(this.email)
      if (this.authenticationService.email_send) this.message = 'Email gesendet'
      if (!this.authenticationService.email_send) this.message = 'Email nicht gefunden'
    }
  }
}

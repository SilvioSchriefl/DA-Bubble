import { Component } from '@angular/core';
import { AuthenticationService } from 'services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  emailFocus: boolean = false
  name: string = ''
  password: string = ''
  email: string = ''
  emailError: boolean = false
  regexEmail = new RegExp('^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$');
  formValid: boolean = false
  nameFocus: boolean = false
  passwordFocus: boolean = false
  validPassword: boolean = false
  match: boolean = false
  matchPassword: string
  passwordConfirmed: boolean = false

  constructor(
    public authenticationService: AuthenticationService,
    private router: Router,
  ) { }


  /**
   * A description of the entire function.
   *
   * @param {any} value - the value to be checked
   * @param {string} inputfield - the input field to be validated
   */
  dataChanged(value: any, inputfield: string) {
    if (inputfield == 'email') {
      this.emailError = this.regexEmail.test(value)
    }
    this.validateForm()
  }


  /**
   * Check if the password contains a number.
   *
   * @return {boolean} true if the password contains a number, false otherwise.
   */
  hasNumber(): boolean {
    return /[0-9]/.test(this.password);
  }


  /**
   * Checks if the password contains any special characters.
   *
   * @return {boolean} Returns true if the password contains special characters, false otherwise.
   */
  hasSpecialChr(): boolean {
    return /[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]/.test(this.password);
  }


  /**
   * Checks if the password has a valid length.
   *
   * @return {boolean} Returns true if the password has a valid length, otherwise false.
   */
  hasValidLength(): boolean {
    return /^.{8,32}$/.test(this.password);
  }


  /**
   * Checks if the password contains an uppercase letter.
   *
   * @return {boolean} True if the password contains an uppercase letter, false otherwise.
   */
  hasUppercase(): boolean {
    return /[A-Z]/.test(this.password);
  }


  /**
   * Checks whether the form has been completely filled out
   */
  validateForm() {
    if (this.password === this.matchPassword) this.passwordConfirmed = true
    else this.passwordConfirmed = false
    if (this.hasNumber() && this.hasSpecialChr() && this.hasValidLength() && this.hasUppercase() && this.name.length > 2 && this.emailError && this.passwordConfirmed) this.formValid = true
    else this.formValid = false    
  }


  /**
   * creates a new user account and redirects to the choose avatar component
   */
  async signUp() {
    this.authenticationService.userName = this.name
    if (this.formValid) await this.authenticationService.SignUp(this.email, this.password)
    if (this.authenticationService.signUp_successful) {
      setTimeout(() => this.router.navigateByUrl('/choose-avatar'), 1900);
    }
  }
}


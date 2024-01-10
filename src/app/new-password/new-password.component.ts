import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {

  password: string = ''
  password_2: string = ''
  pwFocus_2: boolean
  pwFocus: boolean
  passwordConfirmed: boolean
  formValid: boolean
  code: string
  codeVerified: boolean;
  resetFailed: boolean = false;

  constructor(private route: ActivatedRoute, private afAuth: AngularFireAuth) { }

  /**
   * Initializes the component and subscribes to the query parameters of the route. */
  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      this.code = params['oobCode'];
      this.afAuth.verifyPasswordResetCode(this.code)
        .then(email => {
          this.codeVerified = true;
        })
        .catch(error => {
          console.log(error);
        })
    })
  }


  /**
   * Updates the data based on the given value and password.
   *
   * @param {string} value - The new value.
   * @param {string} pw - The password for validation.
   */
  dataChanged(value: string, pw: string) {
    if (pw == 'pw1') this.password = value
    if (pw == 'pw2') this.password_2 = value
    this.validateForm()
  }


  /**
   * Checks if the password contains a number.
   *
   * @return {boolean} true if the password contains a number, false otherwise
   */
  hasNumber(): boolean {
    return /[0-9]/.test(this.password);
  }


  /**
   * Checks if the password contains any special characters.
   *
   * @return {boolean} True if the password contains special characters, false otherwise.
   */
  hasSpecialChr(): boolean {
    return /[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]/.test(this.password);
  }


  /**
   * Checks if the password has a valid length.
   *
   * @return {boolean} Returns true if the password has a length between 8 and 32 characters, false otherwise.
   */
  hasValidLength(): boolean {
    return /^.{8,32}$/.test(this.password);
  }


  /**
   * Check if the password contains an uppercase letter.
   *
   * @return {boolean} True if the password has at least one uppercase letter, false otherwise.
   */
  hasUppercase(): boolean {
    return /[A-Z]/.test(this.password);
  }


  /**
   * Checks whether the form has been completely filled out
   */
  validateForm() {
    if (this.password === this.password_2) this.passwordConfirmed = true
    if (this.hasNumber() && this.hasSpecialChr() && this.hasValidLength() && this.hasUppercase() && this.passwordConfirmed) this.formValid = true
  }


  /**
   * sets the user's new password
   * 
   */
  resetPassword() {
    if (!this.formValid) return;
    this.afAuth.confirmPasswordReset(this.code, this.password)
      .then(resp => {
        console.log(resp);
      })
      .catch(error => {
        console.log(error);
        this.resetFailed = true;
      });
  }
}






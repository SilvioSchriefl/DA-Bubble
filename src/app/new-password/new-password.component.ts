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


  dataChanged(value: string, pw: string) {
    if (pw == 'pw1') this.password = value
    if (pw == 'pw2') this.password_2 = value
    this.validateForm()
  }


  hasNumber() {
    return /[0-9]/.test(this.password);
  }


  hasSpecialChr() {
    return /[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]/.test(this.password);
  }


  hasValidLength() {
    return /^.{8,32}$/.test(this.password);
  }


  hasUppercase() {
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






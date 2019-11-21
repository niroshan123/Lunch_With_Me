import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

import { authService } from "../../services/auth.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private flashMessagesService: FlashMessagesService,
    private authService: authService,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkLoggedIn();

    this.registerForm = this.formBuilder.group({
      //controlname: ['initial value', rules]
      username: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(14) ]],
      password: ['', [ Validators.required , Validators.minLength(4),Validators.maxLength(14) ]],
      confirmPass: ['', [ Validators.required, Validators.minLength(4),Validators.maxLength(14) ]],
      email: ['', [ Validators.required, Validators.minLength(4) ]]
    });
  }

  checkLoggedIn(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(["/"]);
    }
  }
  isValid(controlName) {
    return this.registerForm.get(controlName).invalid && this.registerForm.get(controlName).touched;
  }
  onRegisterSubmit(): void {
    
    this.authService.registerUser(this.registerForm.value)
      .subscribe(data => {
          if (data.success == true) {
               // this.authService.storeUserData(data.token, data.user, data.email);
                localStorage.setItem("email", this.registerForm.value['email']);
                this.flashMessagesService.show(data.msg, {cssClass: "alert-success", timeout: 7000});
          // this.authService.authenticateUser(this.registerForm.value)
          // .subscribe(data => {
          //   if (data.success == true) {
          //     this.authService.storeUserData(data.token, data.user, data.email);
          //     localStorage.setItem("email", this.registerForm.value['email']);
          //     this.flashMessagesService.show(data.msg, {cssClass: "alert-success", timeout: 999999});
          
          //    /// this.router.navigate(["/registerdetails"]);
          //   } else {
          //     this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
          //   }
          // });
          //this.router.navigate(["/registerdetails"]);
        } else {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
        }
      });
  }

}

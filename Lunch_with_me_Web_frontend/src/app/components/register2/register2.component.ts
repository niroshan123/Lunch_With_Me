import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

import { authService } from "../../services/auth.service";

@Component({
  selector: 'app-register2',
  templateUrl: './register2.component.html',
  styleUrls: ['./register2.component.scss']
})
export class Register2Component implements OnInit {

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
      username: ['', [ Validators.required, Validators.minLength(4) ]],
      password: ['', [ Validators.required , Validators.minLength(4) ]],
      confirmPass: ['', [ Validators.required, Validators.minLength(4) ]],
      email: ['', [ Validators.required, Validators.minLength(4) ]]
    });
  }

  checkLoggedIn(): void {
    if (!this.authService.loggedIn()) {
      this.router.navigate(["/register"]);
    }
  }

  onRegisterSubmit(): void {
    this.authService.registerUser(this.registerForm.value)
      .subscribe(data => {
        if (data.success == true) {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-success", timeout: 3000});
          this.router.navigate(["/login"]);
        } else {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
        }
      });
  }

}

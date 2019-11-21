import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { authService } from "../../services/auth.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  myForm: FormGroup;
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private flashMessagesService: FlashMessagesService,
    private api: ApiService,
    private authService: authService,
    private router: Router
  ) { }

  ngOnInit() {
  

    this.myForm = this.formBuilder.group({
      email: [localStorage.getItem("email")],
    //  username: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(14) ]],
    newpassword: ['', [ Validators.required , Validators.minLength(4) ]],
   newcnfpass: ['', [ Validators.required, Validators.minLength(4) ]],
     
    });
  }
  abc() {
    

        if (this.myForm.valid) {
  console.log(this.myForm)
         this.authService.resetpassword(this.myForm.value)
            .subscribe(
              data => {
                console.log("reset password is succeeded");
                console.log(data)
                this.successMessage = data;
                if (data.success == true) {
                  this.flashMessagesService.show(data.msg, {cssClass: "alert-success", timeout: 1000});
                  this.router.navigate(["/login"]);
                }
                else {
                  this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
                }
              
              },
              error => {console.log(error)}

            )
    
    }
    
  }

  isValid(controlName) {
    return this.myForm.get(controlName).invalid && this.myForm.get(controlName).touched;
  }

 
}
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
@Component({
  selector: 'app-forgotpass',
  templateUrl: './forgotpass.component.html',
  styleUrls: ['./forgotpass.component.scss']
})
export class ForgotpassComponent implements OnInit {
  myForm: FormGroup;
  msg=null;

  constructor(
    private formBuilder: FormBuilder,
    private flashMessagesService: FlashMessagesService,
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
  

    this.myForm = this.formBuilder.group({
      email: ['', [ Validators.required, Validators.minLength(4) ]]
    });
  }

  isValid(controlName) {
    return this.myForm.get(controlName).invalid && this.myForm.get(controlName).touched;
  }
 
  abc() {
    console.log(this.myForm.value);
     localStorage.setItem("email",this.myForm.value.email)
     if (this.myForm.valid) {
     this.api.forgotpasswordSentanEmail(this.myForm.value)
            .subscribe( data => {
                console.log("reset password is succeeded");
                this.msg="Send an email";
          },
              error =>    {this. flashMessagesService.show('please try again later!', { cssClass: 'alert-danger' } )
              
              this.msg=null;;
        }
      
        );
       
    }
    
  }
}

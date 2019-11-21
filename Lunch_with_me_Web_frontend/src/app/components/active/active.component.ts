import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { authService } from 'app/services/auth.service';
import { identifierName } from '@angular/compiler';
import { ApiService } from 'app/services/api.service';
@Component({
  selector: 'app-active',
  templateUrl: './active.component.html',
  styleUrls: ['./active.component.scss']
})
export class ActiveComponent implements OnInit {
  successMessage: String = '';
  username: string;
  id:String;
  constructor(   private formBuilder: FormBuilder,
    private flashMessagesService: FlashMessagesService,
    private authService: authService,
    private api:ApiService,
    private router: Router) {
  }

  ngOnInit() {
    //  let email = localStorage.getItem("email");
    // console.log(email)
 
    this.authService.active()
  
    }

  next(){
  
          this.router.navigate(["/registerdetails"]);
  }
}
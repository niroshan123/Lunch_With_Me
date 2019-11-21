import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

import { authService } from "../../services/auth.service";
import { ChatService } from "../../services/chat.service";
import { AuthService } from "angular2-social-login";
import { ApiService } from 'app/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  sub: any;
  public user;

  constructor(
    private _router: Router,
    private formBuilder: FormBuilder,
    private authService: authService,
    private router: Router,
    private flashMessagesService: FlashMessagesService,
    private chatService: ChatService,
    public _auth: AuthService,
    private apiService:ApiService
  ) { }

  ngOnInit() {
    this.checkLoggedIn();

    this.loginForm = this.formBuilder.group({
      //controlname: ['initial value', rules]
      username: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(14) ]],
      password: ['', [ Validators.required, Validators.minLength(4) ]]
    });
  }

  checkLoggedIn(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(["/home"]);
    }
  }

  onLoginSubmit(): void {
    this.authService.authenticateUser(this.loginForm.value)
      .subscribe(data => {
        if (data.success == true) {
          //console.log(data.email);
          this.authService.storeUserData(data.token, data.user, data.email);
          this.chatService.connect(data.user.username);
          if(Object.keys(JSON.parse(localStorage.getItem('user'))).length==6)
            this._router.navigate(['/']);
          else
            this.router.navigate(["/map"]);
        } else {
          this.flashMessagesService.show(data.msg, {cssClass: "alert-danger", timeout: 3000});
        }
      });
  }



  signIn(provider){
    this.sub = this._auth.login(provider).subscribe(
      (data) => {
      //   console.log(data);
        this.user=data;
    


       //  this.apiService.sendToRestApiMethod(this.user.email,this.user.name) .subscribe(dataGoogle => {
       
       this.authService.googleLogin(this.user.email) .subscribe(data => {
     //   console.log(this.user.email);
      
          
      //    // this.authService.storeUserData(data.token, data.user, data.email);
      
      //     if(Object.keys(JSON.parse(localStorage.getItem('user'))).length==6)
      //       this._router.navigate(['/home']);
        
       });
       
 
    //  this.apiService.sendToRestApiMethod(this.user.email,this.user.name)



      }
    )
  }

  logout(){
    this._auth.logout().subscribe(
      (data)=>{
        console.log(data);
        this.user=null;}
    )
  }

  // ngOnDestroy(){
  //   this.sub.unsubscribe();
  // }

}

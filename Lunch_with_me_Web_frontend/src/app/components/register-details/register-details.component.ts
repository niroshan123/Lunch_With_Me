import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

import { authService } from "../../services/auth.service";
import { ApiService } from 'app/services/api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-register-details',
  templateUrl: './register-details.component.html',
  styleUrls: ['./register-details.component.scss']
})


export class RegisterDetailsComponent implements OnInit {

  registerForm: FormGroup;
  Interest = {
    Food1: false,
    Food2: false,
    Food3: false,
    Food4: false,
    Food5: false,
    Food6: false,
    Hobbies1: false,
    Hobbies2: false,
    Hobbies3: false,
    Hobbies4: false,
    Hobbies5: false,
    Hobbies6: false,
    Hobbies7: false,
    Hobbies8: false,
    Hobbies9: false,
    Drinks1: false,
    Drinks2: false,
    Drinks3: false
  };
  img = null;
  myProf = 'Engineer';
  intProf= 'Engineer';
  error= null;

  constructor(
    private formBuilder: FormBuilder,
    private flashMessagesService: FlashMessagesService,
    private authService: authService,
    private apiService:ApiService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    let val = {};
    console.log(this.checkLoggedIn())
    if(this.checkLoggedIn()){
      this.http.get('http://localhost:8080/users', { headers: new HttpHeaders({Authorization: localStorage.getItem('token')}) } ).subscribe(
        data => {
          if(data['success']){
            val = data['users'][0];
            //console.log(val['date_of_birth']);
            this.registerForm = this.formBuilder.group({
              fullname: new FormControl(val['fullname'], Validators.required),
          gender: new FormControl(val['gender']),
            dob:new FormControl(val['date_of_birth'].substring(0, 10), Validators.required),
          self_description:new FormControl(val['message'], Validators.required),
          
      //    telephone: [val['telephone'], [ Validators.required, Validators.minLength(9), Validators.maxLength(15) ]],
          //interest:new FormControl(null, Validators.required),
          //image:new FormControl(null),
            });
            this.myProf = val['myProf'];
            this.intProf = val['intProf'];
            for(var i of val['interest']){
              this.Interest[i] = true;
            }
            this.b64 = val['image'];
          }
        },
        error => console.log(error)
      );
    }

    this.registerForm = this.formBuilder.group({
      fullname: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(20) ]],
      self_description: ['', [ Validators.required , Validators.minLength(60), Validators.maxLength(250) ]],
      gender: ['', [ Validators.required]],
      dob: ['']
      // image:['', [ Validators.required ]],
      // myProf:['', [ Validators.required ]],
      // intProf:['', [ Validators.required]]

    });

  //     fullname: new FormControl(null, Validators.required),
  //  gender: new FormControl(null),
  //   dob:new FormControl(null, Validators.required),
  //  self_description:new FormControl(null, Validators.required),
   
  // telephone: ['', [ Validators.required, Validators.minLength(9), Validators.maxLength(15) ]],
  //interest:new FormControl(null, Validators.required),
  //image:new FormControl(null),
    
  }

  checkLoggedIn(): Boolean {
    if (!localStorage.getItem("token")) {
      return false;
    }
    return true;
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
  b64 = null;

  isValid(controlName) {
    return this.registerForm.get(controlName).invalid && this.registerForm.get(controlName).touched;
  }

  onFileChanged(event) {

    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
         //alert(reader.result.split(',')[1]);
        //\this.fileName = file.name + " " + file.type;
        this.b64 = 'data:image/png' + ';base64,' + reader.result.split(',')[1];
      };
    }
  }


  register() {
    console.log(this.Interest);

    if (!this.registerForm.valid || !this.b64 || (!this.Interest.Food1 && !this.Interest.Food2 && !this.Interest.Food3 && !this.Interest.Food4 && !this.Interest.Food5 && !this.Interest.Food6 && !this.Interest.Hobbies1 && !this.Interest.Hobbies2 && !this.Interest.Hobbies3 && !this.Interest.Hobbies4 && !this.Interest.Hobbies5 && !this.Interest.Hobbies6 && !this.Interest.Hobbies7 && !this.Interest.Hobbies8 && !this.Interest.Hobbies9 && !this.Interest.Drinks1 && !this.Interest.Drinks2 && !this.Interest.Drinks3)) {
    //  this._myservice.submitRegi(this.myForm.value)
    console.log(this.registerForm)
      this.error = 'Invalid form';
       return;
          //   this._router.navigate(['/']);  
    }

let inte = []
for(var i in this.Interest){
  if(this.Interest[i]){
    inte.push(i);
  }
}
    
var obj = this.registerForm.value;
obj['interest'] = inte;
obj['image'] = this.b64;
obj['intProf']= this.intProf;
obj['myProf'] = this.myProf;
console.log(obj);
obj.email = localStorage.getItem("email");

console.log("send data - "+JSON.stringify(obj))

    var useemail = localStorage.getItem("email")
    console.log("email - "+useemail)
    this.apiService.submitRegi(JSON.stringify(obj))
   // console.log(JSON.stringify(this.registerForm.value));
.subscribe(
  data=>{console.log(data);
    //localStorage.removeItem("email")
    this.router.navigate(["/login"]);

    error=>console.error(error)
  }
)  

  }

}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { authService } from './auth.service';

@Injectable()
export class ApiService {

  constructor(private _http: HttpClient, private auth:authService) { }

  host = 'http://localhost:8080/';

  //Save Location & meeting time
  map(lat, lon){
    console.log(lat);
    return this._http.get(this.host + 'users/locationAdd/' + this.auth.getUserData()['user']['id'] + '?lng=' + lon + '&lat='+lat,{
      observe:'body',
      headers:new HttpHeaders().append('Content-Type','application/json')
    });
  }

// Sent an forgot password email 
forgotpasswordSentanEmail(body:any){
  
  return this._http.post(this.host+ 'users/forgotpasswordEmailVerification', body,{});
}

//Register 2
submitRegi(body:any){
  return this._http.post(this.host + 'users/registerdetails', body,{
    observe:'body',
    headers:new HttpHeaders().append('Content-Type','application/json')
  });
}
getfrienddetails(){
 
 return this._http.get(this.host + 'users/getSugestedProfileDetails/:_id',{
    observe:'body',
    headers:new HttpHeaders().append('Content-Type','application/json')
  });
}


// SocialLogin(body:any){
//   console.log(body.email);
//   return this._http.post(this.host + 'users/Socialregister', body,{
//     observe:'body',
    
//     headers:new HttpHeaders().append('Content-Type','application/json')
//   });
 
// }

//sendToRestApiMethod(email: string,username: string){

  googleLogin(body:any){
    console.log(body)
    return this._http.post(this.host + 'users/google', body,{
      observe:'body',
      headers:new HttpHeaders().append('Content-Type','application/json')
    });

}

}

import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.scss']
})
export class FindComponent implements OnInit {

  timeF = null;
  timeT = null;
  time = null;
  lng = null;
  lat = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    navigator.geolocation.getCurrentPosition( pos => {
      this.lng = +pos.coords.longitude;
      this.lat = +pos.coords.latitude;
      console.log(this.lng);
      console.log(this.lat);
  });
  }

  save(){
    this.http.post('http://localhost:8080/users/meet', {'timeF': this.timeF, 'timeT': this.timeT, 'email': localStorage.getItem('email')},{ headers: new HttpHeaders({Authorization: localStorage.getItem('token')}) } ).subscribe(
      data => console.log(data),
      error => console.log(error)
    );
    localStorage.setItem('timeF', this.timeF);
    localStorage.setItem('timeT', this.timeT);
    this.router.navigate(['/map']);

  }

  saveN(){
    var d = new Date();
    d.setHours(this.time.substring(0,2), this.time.substring(3,5), 0);
    //console.log(d);
    this.http.post('http://localhost:8080/users/meet', {'timeF': d.toISOString(), 'timeT': d.toISOString(), 'pickupLng': this.lng.toString(), 'pickupLat': this.lat.toString(), 'email': localStorage.getItem('email')},{ headers: new HttpHeaders({Authorization: localStorage.getItem('token')}) } ).subscribe(
      data => console.log(data),
      error => console.log(error)
    );
    localStorage.setItem('timeF', d.toISOString());
    localStorage.setItem('timeT', d.toISOString());
    
  this.timeF = localStorage.getItem('timeF');
      this.timeT = localStorage.getItem('timeT');
      if(this.timeF == this.timeT){
        localStorage.setItem('pickupLng', this.lng.toString());
        localStorage.setItem('pickupLat', this.lat.toString());
        this.router.navigate(['/users']);
      }

  }

}
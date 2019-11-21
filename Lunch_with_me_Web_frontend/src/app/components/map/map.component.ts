import { Component, OnInit, ElementRef } from '@angular/core';
import {Location} from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { ClassField } from '@angular/compiler/src/output/output_ast';
//import { DOCUMENT } from '@angular/common'; 

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

  export class MapComponent implements OnInit {
//when location is not allowed for the app this coordinates will be considered
//if its allowed the towerlocation will be considered
    location = {
      lat: 6.7951,
      lng: 79.9008
      
      ,
      zoom: 12,
      marker: {
        lat: 6.7951,
        lng: 79.9008
        ,
        draggable: true
      },
      keyword: null
    };
    errorF = null;
    errorT = null;
  
    timeF = localStorage.getItem('timeF');
    timeT = localStorage.getItem('timeT');
    now = false;
    time = null;
    timeFA = null;
    timeTA = null;
  
    constructor(
      private _router: Router,
      private _activatedRoute: ActivatedRoute,
      private http: HttpClient,
      private api: ApiService,
      private document: ElementRef,
    ) { }
  
    ngOnInit() {
      this.errorF = null;
      this.errorT = null;
      
      navigator.geolocation.getCurrentPosition( pos => {
          this.location.lng = +pos.coords.longitude;
          this.location.lat = +pos.coords.latitude;
          this.location.marker.lng = this.location.lng;
          console.log(this.location.lng);
          console.log(this.location.lat);
      });
      this.timeF = localStorage.getItem('timeF');
          this.timeT = localStorage.getItem('timeT');
          if(this.timeF == this.timeT){
            this.now = true;
            localStorage.setItem('pickupLng', this.location.lng.toString());
            localStorage.setItem('pickupLat', this.location.lat.toString());
            //this._router.navigate(['/users']);
          }
    }
  
    placeMarker($event) {
      console.log($event.coords.lat);
      console.log($event.coords.lng);
      this.location.marker.lat = $event.coords.lat;
      this.location.marker.lng = $event.coords.lng;
      this.location.lat = this.location.marker.lat;
      this.location.lng = this.location.marker.lng;
    }
  
    keyup(){
      this.getUrl('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + this.location.marker.lat + ','+ this.location.marker.lng +'&radius=1500&keyword=' + this.location.keyword + '&key=AIzaSyDIMpYY2k6FMyXAK9T-t1677iXCUHan2h8', {}).subscribe(
        data => {
          console.log(data);
        },
        error => console.log(error)
      );
    }
    search() {
      if (this.location.keyword == null || this.location.keyword === '' || this.location.keyword === ' ') {
        return ;
      }
      console.log(this.location.keyword);
      this.getUrl('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.location.marker.lat + ',' + this.location.marker.lng + '&address=' + this.location.keyword + '&key=AIzaSyDIMpYY2k6FMyXAK9T-t1677iXCUHan2h8', {}).subscribe(
        data => {
          this.searchHandler(data);
        },
        error => console.log(error)
      );
    }
  
    getUrl(url, headers) {
      return this.http.get(`${url}`, { headers: new HttpHeaders(headers) } );
    }
  
    searchHandler(data) {
      console.log(data)
      if (data.results[0]) {
        console.log(data.results[0]);
        this.location.zoom = 15;
        this.location.lat = data.results[0].geometry.location.lat;
        this.location.lng = data.results[0].geometry.location.lng;
        this.location.marker.lat = data.results[0].geometry.location.lat;
        this.location.marker.lng = data.results[0].geometry.location.lng;
      }
      console.log(this.location.lng);
          console.log(this.location.lat);
    }
  
   submit(){
 
  this.http.post('http://localhost:8080/users/meet', {'timeF': this.timeF, 'timeT': this.timeT, 'pickupLng': this.location.lng.toString(), 'pickupLat': this.location.lat.toString(), 'email': localStorage.getItem('email')},{ headers: new HttpHeaders({Authorization: localStorage.getItem('token')}) } ).subscribe(
        data => console.log(data),
        error => console.log(error)
      );
  
      this.api.map(this.location.lat, this.location.lng,).subscribe(
        data => {
          console.log(data);
          //alert('success');
          localStorage.setItem('pickupLng', this.location.lng.toString());
          localStorage.setItem('pickupLat', this.location.lat.toString());
          this._router.navigate(['/home']);
        },
        error => console.log(error)
      );
    }

    show = false;
    showInput(){
      this.show = true;
      this.errorF = null;
      this.errorT = null;
    }
    hideInput(){
      this.show = false;
      this.errorF = null;
      this.errorT = null;
    }
  

    saveN(){
      if(!this.timeFA || !this.timeTA){        
        this.errorF = 'Time Required';
        return ;
      }
      var d = new Date();
      d.setHours(this.timeFA.substring(0,2), this.timeFA.substring(3,5), 0);
      var e = new Date();
      e.setHours(this.timeTA.substring(0,2), this.timeTA.substring(3,5), 0);
      if(d>e){
        this.errorF = 'Start time must be earlier than End Time';
        return ;
      }
      if( e<new Date() ){
        if(d<new Date())
          this.errorF = 'Invalid Time';
        this.errorT = 'Invalid Time';
        return ;
      }
      if(d<new Date()){
        this.errorF = 'Invalid Time';
        return ;
      }
      this.hideInput();
      this.timeF = d.toISOString();
      this.timeT = e.toISOString();
      console.log(e);
      this.http.post('http://localhost:8080/users/meet', {'timeF': d.toISOString(), 'timeT': e.toISOString(), 'pickupLng': this.location.lng.toString(), 'pickupLat': this.location.lat.toString(), 'email': localStorage.getItem('email')},{ headers: new HttpHeaders({Authorization: localStorage.getItem('token')}) } ).subscribe(
        data => console.log(data),
        error => console.log(error)
      );
      localStorage.setItem('timeF', d.toISOString());
      localStorage.setItem('timeT', e.toISOString());
      
    this.timeF = localStorage.getItem('timeF');
        this.timeT = localStorage.getItem('timeT');
        if(this.timeF == this.timeT){
          localStorage.setItem('pickupLng', this.location.lng.toString());
          localStorage.setItem('pickupLat', this.location.lat.toString());
        //  this._router.navigate(['/users']);
        }
  
    }
    
  
  
  }
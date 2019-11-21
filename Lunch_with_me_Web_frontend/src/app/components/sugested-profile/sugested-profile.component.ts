import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {Http,Response} from '@angular/http';
import { Message } from "../../models/message.model";
import { ChatService } from "../../services/chat.service";
import { authService } from "../../services/auth.service";
import { ApiService } from "../../services/api.service";
import { HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-sugested-profile',
  templateUrl: './sugested-profile.component.html',
  styleUrls: ['./sugested-profile.component.scss']
})
export class SugestedProfileComponent implements OnInit {

  user: Object;
id= ' ';
  username = '';
  email =  '';
  telephone='';
  gender='';
  message=''; 
  profession='';
  constructor(private authService: authService,   private apiService: ApiService,private http:Http) { }



  ngOnInit() { 
  
    
    
}
}
     


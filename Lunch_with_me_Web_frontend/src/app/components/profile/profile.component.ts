import { Component, OnInit } from '@angular/core';
import { authService } from "../../services/auth.service";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  user: Object;

  constructor(private authService: authService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    let username = null;
    this.activatedRoute.queryParams.subscribe(params => {
      username = params['username'];
      console.log(username); // Print the parameter to the console. 
  });
    this.authService.getProfile(username)
      .subscribe(data => {
        this.user = data.users[0];
        console.log(this.user)
      },
      err => {
        console.log(err);
        return false;
      });
  }

}

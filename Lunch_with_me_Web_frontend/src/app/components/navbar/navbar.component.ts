import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { authService } from "../../services/auth.service";
import { ChatService } from "../../services/chat.service";
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';
import { AngularFireList } from 'angularfire2/database';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
  username: string;
  notiList: Observable<any[]>;
  notiCount = 0;
  constructor(
    private authService: authService,
    private router: Router,
    private chatService: ChatService,
    private notiService: NotificationService,
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.notiList = this.notiService.getNotifications();
    this.notiList.subscribe(val => {
      this.notiCount = val.filter(x => x.payload.val().isSeen === false).length;
    });
  }
  setSeen(oid){
    this.notiService.setSeenTrue(oid);
  }
  onLogoutClick(): boolean {
    this.authService.logout();
    this.chatService.disconnect();
    this.router.navigate(["/login"]);
    this.onNavigate();
    return false;
  }

  onNavigate(): void {
    this.collaspseNav();
  }

  collaspseNav(): void {
    let butt = this.el.nativeElement.querySelector(".navbar-toggle");
    let isCollapsed = this.hasClass(butt, "collapsed");
    if (isCollapsed == false) {
      butt.click();
    }
  }

  hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }

}

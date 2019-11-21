import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { authService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

const BASE_URL = environment.backendUrl;

@Injectable()
export class NotificationService {

  constructor(private fb: AngularFireDatabase, private auth: authService, private http: HttpClient) { }

  getNotifications() {
    const uid = this.auth.getUserData().user.id;
    console.log(uid);
    return this.fb.list('Server/notifications/' + uid, ref => ref.orderByPriority()).snapshotChanges();
  }

  setSeenTrue(oid) {
    const uid = this.auth.getUserData().user.id;
    this.fb.object(`Server/notifications/${uid}/${oid}`).update({ isSeen: true });
  }

  likeNotification(id, username) {
    this.http.post(`${BASE_URL}/notifications/addNotification`, {
      "content": `New request from ${this.auth.getUserData().user.username}`,
      "title": "Request",
      "userId": id,
      'username': username,
      "link": "users"
    }).subscribe(res => {
      console.log(res)
    })
  }

  superLikeNotification(id, username) {
    this.http.post(`${BASE_URL}/notifications/addNotification`, {
      "content": `New super like from ${this.auth.getUserData().user.username}`,
      "title": "Super Like",
      "userId": id,
      'username': username,
      "link": `/chat/${this.auth.getUserData().user.username}`
    }).subscribe(res => {
      console.log(res)
    })
  }
  chatNotification(id, username) {
    this.http.post(`${BASE_URL}/notifications/addNotification`, {
      "content": `New chat from ${this.auth.getUserData().user.username}`,
      "title": "Message",
      "userId": id,
      'username': username,
      "link": `/chat/${this.auth.getUserData().user.username}`
    }).subscribe(res => {
      console.log(res)
    })
  }

  acceptNotification(id, username) {
    this.http.post(`${BASE_URL}/notifications/addNotification`, {
      "content": `${this.auth.getUserData().user.username} has accepted your request`,
      "title": "Request accepted",
      "userId": id,
      "username": username,
      "link": "users"
    }).subscribe(res => {
      console.log(res)
    })
  }
}

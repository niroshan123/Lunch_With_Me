import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, Response, RequestOptions } from "@angular/http";
import 'rxjs/add/operator/map';

import * as io from 'socket.io-client';
import { Message } from "../models/message.model";
import { authService } from "./auth.service";
import {environment} from '../../environments/environment';

const BASE_URL = environment.backendUrl;

@Injectable()
export class ChatService {
  private socket: any;
  private chatUrl: string = environment.chatUrl;
  private apiUrl: string = `${BASE_URL}/messages`;
  private usersUrl: string = `${BASE_URL}/users`;
  private chaListURL: string = `${BASE_URL}/users/chatlist`;

  constructor(private authService: authService, private http: Http) { }

  connect(username: string, callback: Function = ()=>{}): void {
    // initialize the connection
    this.socket = io(this.chatUrl, { path: '/chat' });

    this.socket.on('error', (error) => {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    });

    this.socket.on("connect", () => {
      this.sendUser(username);
      console.log("connected to the chat server");
      callback();
    });
  }

  isConnected(): boolean {
    if (this.socket != null) {
      return true;
    } else {
      return false;
    }
  }

  sendUser(username: string): void {
    this.socket.emit("username", {username: username});
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  getConversation(name1: string, name2: string): any {
    let url = this.apiUrl;
    if (name2 != "chat-room") {
      let route = "/" + name1 + "/" + name2;
      url += route;
    }

    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": authToken
    });
    let options = new RequestOptions({ headers: headers });

    // POST
    let observableReq = this.http.get(url, options)
                                 .map(this.extractData);

    return observableReq;
  }

  //Chat List
  getUserList(): any {
    let url = this.chaListURL;

    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": authToken
    });
    let options = new RequestOptions({ headers: headers });

    // POST
    let observableReq = this.http.get(url, options)
                                 .map(this.extractData);

    return observableReq;
  }

  //Get All Users
  getAllUserList(): any {
    let url = this.usersUrl + '/all';

    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": authToken
    });
    let options = new RequestOptions({ headers: headers });

    // POST
    let observableReq = this.http.get(url, options)
                                 .map(this.extractData);

    return observableReq;
  }

  
  sendRequest(id, username){
    let url = this.usersUrl + '/request/' + id +'/' + username;

    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": authToken
    });
    let options = new RequestOptions({ headers: headers });

    // POST
    let observableReq = this.http.get(url, options)
                                 .map(this.extractData);

    return observableReq;
  }

  acceptRequest(id, username){
    let url = this.usersUrl + '/accept/' + id +'/' + username;

    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": authToken
    });
    let options = new RequestOptions({ headers: headers });

    // POST
    let observableReq = this.http.get(url, options)
                                 .map(this.extractData);

    return observableReq;
  }

  receiveMessage(): any {
    let observable = new Observable(observer => {
      this.socket.on("message", (data: Message) => {
        observer.next(data);
      });
    });

    return observable;
  }

  receiveActiveList(): any {
    let observable = new Observable(observer => {
      this.socket.on("active", (data) => {
        observer.next(data);
      });
    });

    return observable;
  }

  sendMessage(message: Message, chatWith: string): void {
    this.socket.emit("message", {message: message, to: chatWith});
  }

  getActiveList(): void {
    this.socket.emit("getactive");
  }

  extractData(res: Response): any {
    let body = res.json();
    return body || { };
  }

}

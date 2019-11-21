import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from "../../models/message.model";
import { ChatService } from "../../services/chat.service";
import { authService } from "../../services/auth.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NotificationService } from '../navbar/notification.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  messageList: Array<Message>;
  userList: Array<any>;
  userFList: Array<any>;
  showActive: boolean;
  sendForm: FormGroup;
  username: string;
  chatWith: string;
  currentOnline: boolean;
  receiveMessageObs: any;
  receiveActiveObs: any;
  noMsg: boolean;
  conversationId: string;
  notify: boolean;
  notification: any = {timeout:null};
  user: any = {
    requests: [],
    friends: []
  };
  isUseresLoaded = false;
  friends = [];
  userAll = [];

  loader = true;
  countL = 0;
  loads = 3;
  CounterL(){
    this.countL++;
    if(this.countL>=this.loads){
      this.loader = false;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private authService: authService,
    private chatService: ChatService,
    private http: HttpClient,
    private noti: NotificationService
  ) { }

  ngOnInit() {
    this.isUseresLoaded = false;
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    console.log(this.username);

    this.route.params.subscribe((params: Params) => {
      this.chatWith = params.chatWith;
    });

    this.sendForm = this.formBuilder.group({
      message: ['', Validators.required ]
    });

    this.getMessages(this.chatWith);

    this.connectToChat();

    this.http.get('http://localhost:8080/users/allusers', { headers: new HttpHeaders({Authorization: localStorage.getItem('token')}) } ).subscribe(
      data => {
        this.userAll  = data['users'];
        this.http.get('http://localhost:8080/users', { headers: new HttpHeaders({Authorization: localStorage.getItem('token')}) } ).subscribe(
          data => {
            this.user  = data['users'][0];
            for(var i=0; i<this.user['friends'].length; i++){
              this.friends.push(this.user['friends'][i]['username']);
              for(var u of this.userAll){
                if(u['username']==this.user['friends'][i]['username']){
                  this.user['friends'][i]['image'] = u['image'];
                  break;
                }
              }
            }
            this.isUseresLoaded = true;
              for(var i=0; i<this.user['requests'].length; i++){
                for(var u of this.userAll){
                  if(u['username']==this.user['requests'][i]['username']){
                    this.user['requests'][i]['image'] = u['image'];
                    break;
                  }
                }
            }
          },
          error => console.log(error)
        );
          },
      error => console.log(error)
    );

  }

  ngOnDestroy() {
    //this.receiveActiveObs.unsubscribe();
    //this.receiveMessageObs.unsubscribe();
  }

  sendRequest(id, username){
    console.log(username);
    this.chatService.sendRequest(id, username).subscribe(
      data => {
        for (let i = 0; i < this.userList.length; i++) {
          if(this.userList[i]['username'] == username)
          this.userList[i]['request'] = true;
        }
        console.log(this.userList)
      },
      error => console.log(error)
    );
  }

  acceptRequest(id, username){
    console.log(username);
    this.chatService.acceptRequest(id, username).subscribe(
      data => {
        this.noti.acceptNotification(null, username);
        console.log(this.userList);
        this.ngOnInit();
      },
      error => console.log(error)
    );
  }

  connectToChat(): void {
    let connected = this.chatService.isConnected();
    if (connected == true) {
      this.initReceivers();
    } else {
      this.chatService.connect(this.username, () => {
        this.initReceivers();
      });
    }
  }

  getMessages(name: string): void {
    this.chatService.getConversation(this.username, name)
      .subscribe(data => {this.CounterL();
        if (data.success == true) {
          this.conversationId = data.conversation._id || data.conversation._doc._id;
          let messages = data.conversation.messages || null;
          if (messages && messages.length > 0) {
            for (let message of messages) {
              this.checkMine(message);
            }
            this.noMsg = false;
            this.messageList = messages;
            this.scrollToBottom();
          } else {
            this.noMsg = true;
            this.messageList = [];
          }
        } else {
          //this.onNewConv("chat-room");
        }
      });
  }

  visited = 0;
  visitedu = 0;
  getUserList(): void {
    if(this.visitedu>10){
      return ;
    }
    this.visitedu++;
    console.log('b');
    this.chatService.getAllUserList()
      .subscribe(data => {this.CounterL();
        console.log(data);
        if (data.success == true) {
          let users = data.users;
          for (let i = 0; i < users.length; i++) {
            console.log(users[i])            
            users[i]['request'] = false;
            for(var z=0; z<users[i]['requests'].length; z++){
              if(users[i]['requests'][z].username == this.username)
                users[i]['request'] = true;
            }

            console.log(this.isUseresLoaded)
            if (users[i].username == this.username || this.friends.indexOf(users[i].username)>=0) {
              //this.user = users[i];
              console.log(this.user);
              users.splice(i, 1);
              i--;
            }
          }
          for (let i = 0; i < users.length; i++) {
              for (let j = 0; j < this.user.friends.length; j++) {
                if (users[i].username == this.user.friends[j].username) {
                  users.splice(i, 1);
                  i--;
                  break;
                }
              }
            
          }
          for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < this.user.requests.length; j++) {  
              if (users[i].username == this.user.requests[j].username) {
                users.splice(i, 1);
                i--;
                break;
              }
            }
          
        }
          console.log(users)
          this.userList = users.sort(this.compareByUsername);

          this.receiveActiveObs = this.chatService.receiveActiveList()
            .subscribe(users => {this.CounterL();
              for(let onlineUsr of users) {
                if (onlineUsr.username != this.username) {
                  let flaggy = 0;
                  for(let registered of this.userList) {
                    if (registered.username == onlineUsr.username) {
                      flaggy = 1;
                      break;
                    }
                  }
                  if (flaggy == 0) {
                    this.userList.push(onlineUsr);
                    this.userList.sort(this.compareByUsername);
                  }
                }
              }

              for (let user of this.userList) {
                let flag = 0;
                for (let liveUser of users) {
                  if (liveUser.username == user.username) {
                    user.online = true;
                    flag = 1;
                    break;
                  }
                }
                if (flag == 0) {
                  user.online = false;
                }
              }

              this.currentOnline = this.checkOnline(this.chatWith);
            });

          this.chatService.getActiveList();
        } else {
          //this.onNewConv("chat-room");
        }
      });
  }

  getFUserList(): void {
    console.log('a');
    if(this.visited>10){
      return ;
    }
    this.visited++;
    console.log('a');
    this.chatService.getUserList()
      .subscribe(data => {
        console.log(data);
        if (data.success == true) {
          let users = data.users;
          for (let i = 0; i < users.length; i++) {
            if (users[i].username == this.username) {
              users.splice(i, 1);
              break;
            }
          }
          this.userFList = users.sort(this.compareByUsername);

          
          this.getUserList();
        } else {
          //this.onNewConv("chat-room");
        }
      });
  }

  initReceivers(): void {
    this.getFUserList();

    this.receiveMessageObs = this.chatService.receiveMessage()
      .subscribe(message => {
        this.checkMine(message);
        if (message.conversationId == this.conversationId) {
          this.noMsg = false;
          this.messageList.push(message);
          this.scrollToBottom();
          this.msgSound();
        } else if (message.mine != true) {
          if (this.notification.timeout) {clearTimeout(this.notification.timeout)};
          this.notification = {
            from: message.from,
            inChatRoom: message.inChatRoom,
            text: message.text,
            timeout: setTimeout(()=>{ this.notify = false }, 4000)
          };
          this.notify = true;
          this.notifSound();
        }
      });
  }

  onSendSubmit(): void {
    let newMessage: Message = {
      created: new Date(),
      from: this.username,
      text: this.sendForm.value.message,
      conversationId: this.conversationId,
      inChatRoom: this.chatWith == "chat-room"
    };

    this.chatService.sendMessage(newMessage, this.chatWith);
    newMessage.mine = true;
    this.noMsg = false;
    this.messageList.push(newMessage);
    this.scrollToBottom();
    this.msgSound();
    this.sendForm.setValue({message: ""});
  }

  checkMine(message: Message): void {
    if (message.from == this.username) {
      message.mine = true;
    }
  }

  onUsersClick(): void {
    this.showActive = !this.showActive;
  }

  onNewConv(username: string) {
    if (this.chatWith != username) {
      this.router.navigate(['/chat', username]);
      this.getMessages(username);
    } else {
      this.getMessages(username);
    }
    this.currentOnline = this.checkOnline(username);
    this.showActive = false;
  }

  notifSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#notifSound');
    sound.play();
  }

  msgSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#msgSound');
    sound.load();
    sound.play();
  }

  scrollToBottom(): void {
    let element: any = this.el.nativeElement.querySelector('.msg-container');
    setTimeout(() => {
      element.scrollTop = element.scrollHeight;
    }, 100);
  }

  checkOnline(name: string): boolean {
    return true;
  }

  compareByUsername(a, b): number {
    if (a.username < b.username)
      return -1;
    if (a.username > b.username)
      return 1;
    return 0;
  }

}

import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from "../../models/message.model";
import { ChatService } from "../../services/chat.service";
import { authService } from "../../services/auth.service";
import { NotificationService } from '../navbar/notification.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})

export class ChatRoomComponent implements OnInit, OnDestroy {
  messageList: Array<Message>;
  userList: Array<any>;
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
  chatAccess = false;
  isFriend = false;

  superLike = false;
  superLikeUsername;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private authService: authService,
    private chatService: ChatService,
    private notiService: NotificationService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.chatWith = params.chatWith;
    });
    //debugger;
    
    this.route.queryParams.subscribe(val => {
      try {
        this.superLike = val.superLike as boolean;
        this.superLikeUsername = val.username;
      } catch (e) {
        console.log(e);
      }
    });
    let username = JSON.parse(localStorage.getItem("user"))['username']
    this.authService.getProfile(username)
      .subscribe(data => {
        let friends = data['users'][0]['friends'];
        for(let i=0; i<friends.length; i++){
          console.log(friends[i].username, this.chatWith)
          if(friends[i].username == this.chatWith){
            this.chatAccess = true;
            this.isFriend = true;
          }
        }
      },
      err => {
        console.log(err);
      });

      
      
    let userData = this.authService.getUserData();
    this.username = userData.user.username;


    this.sendForm = this.formBuilder.group({
      message: ['', Validators.required ]
    });

    this.getMessages(this.chatWith);

    this.connectToChat();

  }

  ngOnDestroy() {
    this.receiveActiveObs.unsubscribe();
    this.receiveMessageObs.unsubscribe();
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
      .subscribe(data => {
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
            //super like chat access
            let msgCount = 0;
            for(let i=0; i<this.messageList.length; i++){
              if(this.messageList[i]['from'] == this.username){
                let date = new Date(this.messageList[i]['created']).toJSON().slice(0,10).replace(/-/g,'-')
                let today = new Date().toJSON().slice(0,10).replace(/-/g,'-');
                if(date == today){
                  msgCount++;
                }
              }
            }
            console.log(msgCount);
            if(msgCount<1){
              this.chatAccess = true;
            }
          } else {
            this.noMsg = true;
            this.messageList = [];
          }
        } 
        else {
          this.onNewConv("chat-room");
        }
      });
  }

  getUserList(): void {
    let usersOn = [];
    this.chatService.getUserList()
      .subscribe(data => {
        usersOn = data['users'][0]['friends'];
        if (data.success == true) {
          let users = data.users[0].friends;
          for (let i = 0; i < users.length; i++) {
            if (users[i].username == this.username) {
              users.splice(i, 1);
              break;
            }
          }
          this.userList = users.sort(this.compareByUsername);

          this.receiveActiveObs = this.chatService.receiveActiveList()
            .subscribe(users => {
              for(let onlineUsr of usersOn) {
                // for(let frie of usersOn){
                //   if(frie.username == onlineUsr.username){
                //     break;
                //   }
                // }
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

              for(let z of data['chat']){
                let is = true;
                for(let zz of this.userList){
                  if(zz.username == z)
                    is = false;
                }
                if(is)
                  this.userList.push({'username': z});
              }

              for (let user of this.userList) {
                let flag = 0;
                for (let liveUser of usersOn) {
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
          this.onNewConv("chat-room");
        }
      });
  }

  initReceivers(): void {
    this.getUserList();

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
    console.log(this.superLike);
    console.log(this.superLikeUsername);
    
    if (this.superLike && this.superLikeUsername) {
      this.notiService.superLikeNotification(null, this.superLikeUsername);
    }
    else {
      this.notiService.chatNotification(null, this.chatWith);
    }

    if(!this.isFriend){
      this.chatAccess = false;
    }
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
    if (name == "chat-room") {
      for (let user of this.userList) {
        if (user.online == true) {
          return true;
        }
      }
      return false;
    } else {
      for (let user of this.userList) {
        if (user.username == name) {
          return user.online;
        }
      }
    }
  }

  compareByUsername(a, b): number {
    if (a.username < b.username)
      return -1;
    if (a.username > b.username)
      return 1;
    return 0;
  }

}

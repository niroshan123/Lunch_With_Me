const express = require('express');
const router = express.Router();
const passport = require('passport');
const Message = require('../models/message');
const User = require('../models/user');


var admin = require("firebase-admin");

var serviceAccount = require("../service.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://notification-fde31.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("Server");

var notiRef = ref.child("notifications");


router.post('/addNotification', (req, res, next) => {
    console.log('add notification called')
    console.log(req.body);

    if (req.body.username) {
        User.findOne(
            {
                username: req.body.username
            }
        ).then(data => {
            console.log(data.username)
            let response = { success: true };
            notiRef.child(data.id).push({
                content: req.body.content,
                title: req.body.title,
                clickLink: req.body.link,
                time: Date.now(),
                isSeen: false
            }).setPriority(0 - Date.now(), ret => { }).then((val) => {
                res.json({ message: 'notification added' }).status(200)
            }).catch((err) => {
                res.json({ message: 'notification not added : ' + err }).status(500)
            });
        })
    } else {
        let response = { success: true };
        notiRef.child(req.body.userId).push({
            content: req.body.content,
            title: req.body.title,
            clickLink: req.body.link,
            time: Date.now(),
            isSeen: false
        }).setPriority(0 - Date.now(), ret => { }).then((val) => {
            res.json({ message: 'notification added' }).status(200)
        }).catch((err) => {
            res.json({ message: 'notification not added : ' + err }).status(500)
        });
    }


});

module.exports = router; 
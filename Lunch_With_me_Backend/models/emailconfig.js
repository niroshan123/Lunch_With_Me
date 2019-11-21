var nodemailer = require("nodemailer");
//const config = require("./keys");
const user = require("./user");
const passwordResetApi = "http://localhost:3000/resetpassword/";
const emailConfirmApi = "http://localhost:3000/confirmemail";

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "niroshanratnayake07@gmail.com",
    pass: "zwyuudwsumnjrevi"
  }
});

//console.log(config.jwtexp)

exports.mailhandlerpasswordreset =  (email,token) => {
  console.log("sending resetpassword email ............");
  var mailOptions = {
    from: "niroshanratnayake07@gmail.com",
    to: email,
    subject: "Password Reset",
    text: ' please visit -<a href="http://localhost:4200/forgotpassword?token=' + token + '">http://localhost:4200/forgotpassword?token=' + token + '</a>',
   //html:'<h1> Hello  ' + username +', <a href="http://localhost:4200/forgotpassword"> <button style="color:red ">Click hear to activate your Account</button> </a> </h1><br> Regards,<br>The Lunch With Me Team</br>'
   html:'<h1>Hello!</h1> Please confirm the password reset by clicking on below button <br><br><a href="http://localhost:4200/forgotpassword?token=' + token + '"> <button style="color:red ">Click hear to activate your Account</button> </a> </h1><br> Regards,<br>The Lunch With Me Team</br>'
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("send email - " + email);
      console.log("Email sent: " + info.response);
    }
  });
};

exports.mailhandleremailconfirm = (email,username,id) => {
  console.log("sending confirm email ............");
  var mailOptions = {
    from: "niroshanratnayake07@gmail.com",
    to: email,
    subject: "Email confirmation on Lunch With Me",
    //text: "  please visit -http://localhost:4200/active/"+ temporarytoken,
   // html:  'Hello  ' + username +`<h1> please visit -${emailConfirmApi}/${id}  to confirm your email </h1>`
   text: " please visit -http://localhost:4200/active/",
   html:'<h1> Hello  ' + username +',</h1><br> Thanks for joining Lunch With Me! Please confirm your email address by clicking on below button<br> <h1> <a href="http://localhost:4200/active"> <button style="color:green ">Click hear to activate your Account</button> </a> </h1><br> Regards,<br>The Lunch With Me Team</br>'
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("send email - " + email);
      console.log("Email sent: " + info.response);
    }
  });
};

//module.exports = {mailhandlerpasswordreset,mailhandleremailconfirm};

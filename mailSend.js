const nodemailer = require('nodemailer');
const {email, pwd} = require("./personal");
module.exports ={
    sendMail:sendMail
}

function sendMail( mailBody, mailHuman){
    let datetime = new Date();
let date = datetime.toISOString().slice(0,10);
let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: pwd
    }
});
  
let mailDetails = {
    from: 'rashichawla2608@gmail.com',
    to: mailHuman,
    subject: ''+date+': '+'Learning',
    text: "Dear Human,\n\nDo ALL of them to have a peaceful sleep\n\n\n\n"+mailBody,
    attachments: [{
        filename: 'topic.pdf',
        path: 'C:\\Users\\91798\\Desktop\\Hackathon1\\topic.pdf',
        contentType: 'application/pdf'
      }],
};
  
mailTransporter.sendMail(mailDetails, function(err, data) {
    if(err) {
        console.log('Error Occurs');
    } else {
        console.log('Email sent successfully');
    }
});
}
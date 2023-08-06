const express = require('express');
const router = express.Router();
var fs = require('fs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('../config/database');
var nodemailer = require('nodemailer');
const User = require('../models/user');

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'bosanskaambasadaujapanu@gmail.com',
        pass: 'mbnlnctripgjsazf'
    }
});

router.post('/mail', (req, res, next) => {
  const data = req.body;
  const mailOptions = {
    from: data.email, // sender address
    to: 'info@bhembassychina.com', // list of receivers
    subject: data.title, // Subject line
    html: "Sadržaj: <br>"+data.text+"<br><br>Ime: "+data.name+"<br>Email: "+data.email// plain text body
  };
  transporter.sendMail(mailOptions, function (err, info) {
   if(err)
     console.log(err)
   else
     console.log(info);
});
  return res.status(200).json({});
});
router.post('/login', (req, res, next) => {
  //uneti podaci
  const email = req.body.email;
  const password = req.body.password;
  //trazimo korisnika
  User.getUserByUserEmail(email, (err, user) => {
    if (err)
      return res.status(500).send("Server error!");
    if (!user)
      return res.status(422).send("User not found");
    //poredimo sifre
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err)
        return res.status(500).send("Server error!");
      if (isMatch) {
        //kreiranje tokena i njegovo slanje korisniku
        const token = jwt.sign({
          data: user
        }, config.secret, {
          expiresIn: 604800
        });
        return res.status(200).json({
          token: 'Bearer ' + token,
          user: {
            name: user.firstName,
            last: user.lastName,
            userName: user.userName,
            email: user.email
          }
        });
      } else //ako se sifre ne slazu obavestavamo korisnika o tome
        return res.status(400).send("Wrong password");
    });
  });
});

router.get('/check', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  res.status(200).send("ok");
});

router.get('/me', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  res.status(200).send(req.user);
});

router.post('/changeme', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  let newData = req.body;
  newData._id = req.user._id;

  delete newData.password;
  User.updateOne(newData, (err, user) => {
    if (err)
      if (err.name === 'MongoError' && err.code === 11000) //mongodb greska
        return res.status(409).send('User already exist!');
      else return res.status(500).send("Server error!");
    return res.status(200).send("changed");
  });

});

router.post('/create', (req, res, next) => {
  //kreiranje korisnickog modela
  //  let newUser=new User(JSON.parse('{"name":"ime","email":"email","password":"sifra","level":1}'));
  //console.log(newUser.name);
  let newUser = new User(req.body);
  //dodavanje korisnika
  User.addUser(newUser, (err) => {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) //mongodb greska
        return res.status(409).send('User already exist!');
      else
        return res.status(500).send("Failed to register!");
    }
    return res.status(201).send("User created!");
  });
});

router.post('/password',passport.authenticate('jwt', { session: false }),(req,res,next)=>{
    //proveravamo unetu staru sifru s pstojecom
    User.comparePassword(req.body.old.toString(),req.user.password.toString(),(err,isMatch)=>{
        if(err)
            return res.status(500).json("Server error!");
        //ako se slazu
        if(isMatch){
            req.user.password=req.body.new;
            //menjamo sifru
            User.updatePass(req.user,(err,newData)=>{
                if(err)
                    return res.status(500).send("Server error!");
                });
            return res.status(200).send("Password changed!");
        }else//ako se ne slazu
            return res.status(400).send("Wrong password");
    });
});

module.exports = router;

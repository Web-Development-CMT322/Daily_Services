//jshint esversion:6
require('dotenv').config()

var pass = "";
const bodyParser = require("body-parser");;
const express = require("express");
const https = require("https");
const ejs = require("ejs")
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
//const md5 = require("md5");
//const encrypt = require("mongoose-encryption")

const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const mongoose = require('mongoose')

var router = express.Router();

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

//Start MongoDB
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.Promise = global.Promise;

mongoose.connect("mongodb+srv://group-20-web:Try12345@cluster20.sx3at.mongodb.net/userData?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true })

//Encryption start
const dataUser = new mongoose.Schema({
  userName: String,
  userEmail: String,
  userPassword: String
});

// const secret = "Thisisthesecretofpassword.";
// dataUser.plugin(encrypt, {secret: secret, encryptedFields: ["userPassword"]});

const User = mongoose.model("UserData", dataUser);

////////////////////////////////////////////////////////////////////////////////////////////////

//const users = []

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.static("public"));

app.get("/Service_Provider_Profile", function(req, res){
  res.render('Service_Provider_Profile.ejs')
});

app.get("/", function(req, res){
  res.render('index.ejs');
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs', {messages: pass})
})

app.post('/login', function(req, res) {

  const useremail = req.body.email;
  const userpassword = req.body.password;

  User.findOne({userEmail: useremail}, function(err, foundUser){

    if(err){
      console.log(err);
    }else{
      if(foundUser){
        bcrypt.compare(userpassword, foundUser.userPassword, function(err, result) {
          // result == true
          if(result === true ){
            res.render("Service_Provider_Profile");
          }else{
            pass = "Please enter again password";
            res.redirect("login");
          }
        });
      }if(!foundUser){

        pass = "No user with that email";
        res.redirect("login");
      }
    }
  });
  // successRedirect: '/Service_Provider_Profile',
  // failureRedirect: '/login',
  // failureFlash: true
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {

  const hashedPassword = await bcrypt.hash(req.body.password, 10)

    // Store hash in your password DB.
  const user = new User({

    userName: req.body.name,
    userEmail: req.body.email,
    userPassword: hashedPassword
  });

  user.save();
  try {
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)

})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

// Personal Service Part
app.get('/personal', (req, res) => {
  res.render('Personal_Services.ejs')
})

app.listen(process.env.PORT || 8000, function() {
  console.log("Example app listening on port 8000!")
});

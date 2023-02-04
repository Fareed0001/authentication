require("dotenv").config() //This is for the .env packsge from https://www.npmjs.com/package/dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

//session code should be placed above mongoose connect and below express
//check https://www.npmjs.com/package/express-session to get better understanding on session
app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); //this method comes with passport and sets it up for use
app.use(passport.session()); //this tell the app to use passport to also set up session

//Connect to your mongodb database
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

//creating encryption schema for the database https://www.npmjs.com/package/mongoose-encryption
const userSchema = new mongoose.Schema ({ //This is to change our schema into a mongoose object schema ie https://www.npmjs.com/package/mongoose-encryption or https://mongoosejs.com/docs/schematypes.html
  email: String,
  password: String
});

//passport-local-mongoose
userSchema.plugin(passportLocalMongoose); //this is what we will use to hash and salt our data and save it in our mongoose database

//creating a model for the database
const User = new mongoose.model("User", userSchema);

//passport local mongoose configuration code
// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); //this will create a cookie to store user data
passport.deserializeUser(User.deserializeUser()); //this will destroy the cookie to reveal the user information

app.get("/", function(req, res) {
  res.render("home");
  //this will render the home.ejs page as the starting page
});

app.get("/login", function(req, res) {
  res.render("login");
  //this will render the login.ejs page
});

app.get("/register", function(req, res) {
  res.render("register");
  //this will render the register.ejs page
});

app.get("/secrets", function(req, res) {
  //here is where we check if the user is authenticated
  if (req.isAuthenticated()){ //if the user is logged in then render the secrets page
    res.render("secrets");
  } else { //else send them to the login page so that they wii login
    res.render("login");
  }
});

//adding a logout route
app.get("/logout", function(req, res) { //here we deauthenticate the user and end the user sesion
  req.logout(function(err) { //this is to logout using passport
    if (err) {
      console.log(err);
    } else {
      res.redirect("/"); //this should redirect them to the homepage
    }
  });
});

//using passport to authenticate new users
app.post("/register", function(req, res) { //This is to recieve the post request from the register form
  User.register({username: req.body.username}, req.body.password, function(err, user) { //using the User model, the argument thats a username value, password and a function
    if (err) {
      console.log(err);
      res.redirect("/register"); //this returns the user back to the regiser page so that they can retry
    } else { //if there are no errors we authenticate the user
      passport.authenticate("local")(req, res, function() { //this function only works if the authentication was successful
          res.redirect("/secrets"); //when the authentication works, the user gets sent into the secrets route
      });
    }
  });
});

app.post("/login", function(req, res) { //this route is to login after users have already registered. it i below the register route because you need to be inside the database before you can login

  const user = new User({ //we create a new user
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) { //this uses the new user to check if an existing user credentials is in our database
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() { //authenticates to see if username matches password in the database
        res.redirect("/secrets"); //this would send the user to the secrets route to check if they are authenticated or not
      });
    }
  });

});













app.listen(3000, function() {
  console.log("Server is hot and running on port 3000");
});
//rs to restart nodemon
//to redirect in app.post route you just write the page name ("home"). but in app.post route u add a forward slash ("/home");

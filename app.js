require("dotenv").config() //This is for the .env packsge from https://www.npmjs.com/package/dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // first require bcrypt

const saltRounds = 10; //This tells the amount of salt rounds. The more the salting the more the user pc will work to generate them

const app = express();

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

//creating a model for the database
const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

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

app.post("/register", function(req, res) { //This is to recieve the post request from the register form
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({ //this follows the user model which follows the user schema
      email: req.body.username, //this will catch whatever the input with the name username contains
      password: hash //this will take the salted hash
    });

    newUser.save(function(err) { //this will save the new user
      if (err) { //if there are errors it will log those err
        console.log(err);
      } else { //if there are not errors it will render the secrets page
        res.render("secrets");
      }
    });

  });
});

app.post("/login", function(req, res) { //this route is to login after users have already registered. it i below the register route because you need to be inside the database before you can login
  const username = req.body.username; //This takes the data of the username input field in the login page
  const password = req.body.password; //This will capture the password the user just tried to use to login
  //now to check the database if the username matches the password
  User.findOne({
    email: username //this will find the document with the user name which was used for the login
  }, function(err, foundUser) { //this is to find one item where the username field matches the email field
    if (err) {
      console.log(err);
    } else {
      if (foundUser) { //if there is a user on our db with the email
        bcrypt.compare(password, foundUser.password, function(err, result) { //this compare method compares the password the user just entered in with the hash in our database which is stored in the foundUser.password field (robo3t to confirm)
          if(result === true) { //if the comparison of the password and saved hash is true, meaning the user got the right password
            res.render("secrets"); //since they passed our authentification, they are allowed to enter
          }
        });
      }
    }
  });
});













app.listen(3000, function() {
  console.log("Server is hot and running on port 3000");
});
//rs to restart nodemon

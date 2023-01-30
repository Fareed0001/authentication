require("dotenv").config() //This is for the .env packsge from https://www.npmjs.com/package/dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); //This is for mongoose-encryption to help encrypt data using AES-256-CBC

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

//to encrypt our data "Secret String Instead of Two Keys" from https://www.npmjs.com/package/mongoose-encryption
const secret = process.env.SECRET; //this is the data you will use to encrypt your database, its value is stored in the .env file
//by using the schema (userSchema), you add a plugin and pass in the secret as a js object
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] }); //NB keep this plugin code above the mongoose model because we are passing the schema in to create the mongoose model so before then we add our encrypt package as a plugin
//This will encrypt only the password field. from https://www.npmjs.com/package/mongoose-encryption (Encrypt Only Certain Fields)
//NB the encryptedFields you pass in the string must match the string in your schema


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
  const newUser = new User({ //this follows the user model which follows the user schema
    email: req.body.username, //this will catch whatever the input with the name username contains
    password: req.body.password //this will catch whatever the input with the name password contains
  });

  newUser.save(function(err) { //this will save the new user
    if (err) { //if there are errors it will log those err
      console.log(err);
    } else { //if there are not errors it will render the secrets page
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res) { //this route is to login after users have already registered. it i below the register route because you need to be inside the database before you can login
  const username = req.body.username; //This takes the data of the username input field in the login page
  const password = req.body.password; //This takes the data of the password input field in the login page

  //now to check the database if the username matches the password
  User.findOne({
    email: username
  }, function(err, foundUser) { //this is to find one item where the username field matches the email field
    if (err) {
      console.log(err);
    } else {
      if (foundUser) { //if there is a user on our db with the email
        if (foundUser.password === password) { //if the found users password matches the password inputted
          //this means that we have that user in our database and the password he typed in matches the one in our database. meaning they are the correct user
          res.render("secrets"); //since they passed our authentification, they are allowed to enter
          //NB: if you console.log(foundUser.password); here, you will get to see the password as plain text
        } else {
          res.render("home");
        }
      } else {
        res.render("home");
      }
    }
  });
});













app.listen(3000, function() {
  console.log("Server is hot and running on port 3000");
});
//rs to restart nodemon

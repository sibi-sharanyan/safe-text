var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  message = require("./models/message"),
  user = require("./models/user"),
  passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect(
  process.env.DATABASEURL || "mongodb://localhost:27017/safetext",
  { useNewUrlParser: true }
);

app.use(
  require("express-session")({
    secret: process.env.SECRET || "sibi",
    resave: false,
    saveUninitialized: false
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
passport.use(new LocalStrategy(user.authenticate()));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// The root that redirects to home
app.get("/", function(req, res) {
  res.redirect("/home"   );
});

//The anonymous home page
app.get("/home/anon", function(req, res) {
  user.find({} , function(err , user) 
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log(req.user);
      res.render("home" , {user1: req.user ,  users : user , anon: true  });
    }
  })
  
});

//The homepage for the user
app.get("/home", function(req, res) {
  user.find({} , function(err , user) 
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log(req.user);
      res.render("home" , {user1: req.user ,  users : user , anon:false  });
    }
  })
  
});

//Display form Send anonymous message to a user
app.get("/convo/:id1/anon", isLoggedIn ,  function(req , res) {
  console.log(req.params.id1);
  console.log(req.params.id2);
  res.render("anon.ejs" , {rec : req.params.id1  } );
  
});

//Post anonymous message to the database
app.post("/anon" , isLoggedIn , function(req , res)
{ 
message.create({content : req.body.submission  ,  to : req.body.to   } , function(err ,msg) {
      if(err)
      {
        console.log(err);
      }
      else{
        console.log(msg);
        res.redirect("/home/anon");
      }
  })
}
)

//Page for Reciever to see the anonymous messages he/she has recieved
app.get("/convo/anon/:id1", isLoggedIn ,  function(req , res) {
  // console.log(req.params.id1);
  // console.log(req.params.id2);
  message.find({from: undefined , to: req.params.id1   } , function(err , msg) 
  {
      if(err)
      {
        console.log(err);
      }
      else{
        res.render("anonmsg.ejs" , {rec : req.params.id1 , msg: msg  } );

      }
  } )
});


//Display The conversation and form to send a message to a particular user 
app.get("/convo/:id1/:id2", isLoggedIn ,  function(req , res) {
  console.log(req.params.id1);
  console.log(req.params.id2);
  message.find({$or:[{from: req.params.id2  , to: req.params.id1} , {from: req.params.id1  , to: req.params.id2 } ]  } , function(err , msg)
  {
      if(err)
      {
        console.log(err);
      }
      else
      {
        res.render("convo.ejs" , {rec : req.params.id1 , msg : msg } );
      }
  } )
  
});




//Post The message to the database
app.post("/convo" , isLoggedIn , function(req , res)
{ 
message.create({content : req.body.submission , from : req.user.id , to : req.body.to   } , function(err ,msg) {
      if(err)
      {
        console.log(err);
      }
      else{
        console.log(msg);
        res.redirect("/convo/" + req.body.to + "/" + req.user.id );
      }
  })
}
)

//Display form to register user
app.get("/register", function(req, res) {
  res.render("register", { user: req.user });
});

//Register the user
app.post("/register", function(req, res) {
  req.body.username;
  req.body.password;

  user.register(
    new user({ username: req.body.username }),
    req.body.password,
    function(err, user) {
      if (err) {
        console.log(err);
        if (err.name == "UserExistsError") {
          return res.render("login", { userexist: true });
        }
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/home");
        });
      }
    }
  );
});

// Display login form to the user
app.get("/login", function(req, res) {

  res.render("login", { userexist: false });

});

// Logging in the user
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);


// Log out the user
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});


app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("The SafeText Server Has Started!");
});

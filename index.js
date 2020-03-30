var express = require("express");
var app = express();

var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var databaseURL = "mongodb://admin:tajadmin1@ds125195.mlab.com:25195/eyecoin";
var ObjectId = require("mongodb").ObjectId;

var passport = require("passport");
var jwt = require("jsonwebtoken");
var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret";

passport.use(
  new JwtStrategy(opts, function(jwt_payload, done) {
    done(null, jwt_payload);
  })
);

var bodyParser = require("body-parser");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

var cors = require("cors");

app.use(cors({ credentials: true, origin: true }));
app.options("*", cors());

app.get("/", function(req, res) {
  res.sendfile("index.html");
});

app.get("/css/index.css", function(req, res) {
  res.sendfile("css/index.css");
});

app.get("/js/angular-bootstrap-calendar.js", function(req, res) {
  res.sendfile("js/angular-bootstrap-calendar.js");
});

app.get("/js/factory.js", function(req, res) {
  res.sendfile("js/factory.js");
});

app.get("/js/controller.js", function(req, res) {
  res.sendfile("js/controller.js");
});

// GET REQUESTS : all users, all transactions, transactions by user

// Gets all users, and return it.
// Render page with ejs?
app.get("/users", function(req, res) {
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.get('/users' : Connected to client");

      var db = client.db("eyecoin"); // change to DB name
      var userCollection = db.collection("users"); // change to Collection name

      userCollection.find({}).toArray(function(err, results) {
        if (results) {
          console.log(results);
          res.send(results);
        }
      });
    } else {
      console.log("Error connecting to Database");
      console.log(err);
    }
  });
});

app.get(
  "/user/:userId",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    MongoClient.connect(databaseURL, function(err, client) {
      if (client) {
        console.log("app.get('/ex' : Connected to client");

        var db = client.db("eyecoin");
        var userCollection = db.collection("users"); // Users does not exist yet.

        // userCollection.find({{ userId: userId }}).toArray(function(err, results) {
        userCollection.find({}).toArray(function(err, results) {
          if (results) {
            console.log(results);
            res.send(results);
          }
        });
      } else {
        console.log("Error connecting to Database");
        console.log(err);
      }
    });
  }
);

//Look up transactions based Logged in User
app.get("/trans/user", function(req, res, next) {
  passport.authenticate("jwt", { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log("no user");
      //show not logged in popup.
      return res.redirect("/login");
    }
    console.log("user", user, " info ", info);

    MongoClient.connect(databaseURL, function(err, client) {
      if (client) {
        console.log("app.get('/trans/user' : Connected to client");

        var db = client.db("eyecoin"); //change name
        var transactionCollection = db.collection("demo"); //hcange name

        transactionCollection
          .find({ userId: parseInt(user.id) })
          .toArray(function(err, results) {
            if (results) {
              console.log(results);
              res.send(results);
            }
          });
      }
    });
  })(req, res, next);
});

//lookup transactions by req.params
app.get("/trans/user/:userId", function(req, res) {
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.get('/users' : Connected to client");

      var db = client.db("eyecoin"); // change to DB name
      var transCollection = db.collection("demo"); // change to Collection name
      console.log(req.params.userId);
      transCollection
        .find({ userId: parseInt(req.params.userId) })
        .toArray(function(err, results) {
          if (results) {
            console.log(results);
            res.send(results);
          }
        });
    } else {
      console.log("Error connecting to Database");
      console.log(err);
    }
  });
});

// POST REQUEST : create User, create Transaction.  update User, update Transaction , delete

// Insert a Transaction.  User is same
app.post("/trans", function(req, res, next) {
  passport.authenticate("jwt", { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log("no user");
      return res.redirect("/login");
    }
    console.log("user", user, " info ", info);

    // app.post("/trans", function(req, res) {
    MongoClient.connect(databaseURL, function(err, client) {
      if (client) {
        console.log("app.post('/trans' : Connected to client");

        var db = client.db("eyecoin"); //change name
        var transactionCollection = db.collection("demo"); //hcange name

        var passedTransObject = req.body;
        passedTransObject.userId = user.id;

        transactionCollection.find({}).toArray(function(err, results) {
          if (results) {
            passedTransObject.id = results.length;
            console.log(passedTransObject);

            transactionCollection.insert(req.body, function(err, results) {
              if (!err) {
                console.log("Successful insert", results);
                res.send(req.body);
              } else {
                console.log("Insert transaction error", err);
                res.status(400).send(err);
              }
            });
          }
        });
      } else {
        console.log("Error connecting to Database", err);
      }
    });
  })(req, res, next);
});

//Create User.  {}.email , password, id
app.post("/register", function(req, res) {
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.post('/register' : Connected to client");

      var db = client.db("eyecoin"); //change name
      var userCollection = db.collection("users"); //hcange name

      var passedUserObject = req.body;
      passedUserObject.createdDate = new Date();

      console.log(passedUserObject);

      if (passedUserObject && passedUserObject.email) {
        //Check to see if the email exists
        userCollection
          .find({ email: passedUserObject.email.toLowerCase() })
          .toArray(function(err, results) {
            if (results.length == 0) {
              //If not Insert
              userCollection.find({}).toArray(function(err, results) {
                if (results) {
                  passedUserObject.id = results.length;
                  userCollection.insert(req.body, function(err, results) {
                    if (!err) {
                      console.log("Successful insert", results);
                      res.send(req.body);
                    } else {
                      console.log("Insert transaction error", err);
                      res.status(400).send(err);
                    }
                  });
                }
              });
            } else {
              console.log(passedUserObject.email, " already exists, not added");
            }
          });
      }
    } else {
      console.log("Error connecting to Database", err);
    }
  });
});

//Login User
app.post("/login", function(req, res) {
  //look up username in db,
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.post('/register' : Connected to client");

      var db = client.db("eyecoin"); //change name
      var userCollection = db.collection("users"); //hcange name

      var passedUserObject = req.body;

      passedUserObject.loggedIn = passedUserObject.loggedIn || [];
      passedUserObject.loggedIn.push(new Date());

      console.log(passedUserObject);

      userCollection
        .find({ email: passedUserObject.email.toLowerCase() })
        .toArray(function(err, results) {
          if (results.length > 0) {
            if (results[0].password == passedUserObject.password) {
              //TODO: do an update with loggedIn, then sign and send token
              var token = jwt.sign(results[0], "secret", {
                expiresIn: "1h"
              });
              res.json({ jwt: token });
            } else {
              res.json({ error: "failed Login to " + passedUserObject.email });
            }
          } else {
            res.json({ error: "no such user " + passedUserObject.email });
          }
        });
    }
  });
});

// Update a transaction.  Called when Updating, or resyncing.  User is same.
app.post("/trans/:transId", function(req, res) {
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.post('/update/:transId' : Connected to client");

      var db = client.db("exercise-journal"); // change db name
      var transactionCollection = db.collection("workouts"); // change collection name

      var copy = req.body;
      delete copy._id;
      var o_id = new ObjectId(req.params.transId);

      transactionCollection.update({ _id: o_id }, { $set: copy }, function(
        err,
        results
      ) {
        if (err) {
          console.log("Edit Search workout error");
          console.log(err);
          res.status(400).send(err);
        } else {
          console.log("Successful edit search");
          console.log(results);
          res.send(copy);
        }
      });
    } else {
      console.log("Error connecting to Database");
      console.log(err);
    }
  });
});

// Deletes an transaction.  User is same
app.post("/delete/trans/:transId", function(req, res) {
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.post('/delete/:transId' : Connected to client");

      var db = client.db("exercise-journal"); //change names
      var workoutCollection = db.collection("workouts"); //change name

      var o_id = new ObjectId(req.params.transId);

      workoutCollection.deleteOne({ _id: o_id }, function(err, results) {
        if (err) {
          console.log("Edit Search workout error");
          console.log(err);
          res.status(400).send(err);
        } else {
          console.log("Successful edit search");
          console.log(results);
          res.send(results);
        }
      });
    } else {
      console.log("Error connecting to Database");
      console.log(err);
    }
  });
});

app.listen(process.env.PORT || 3000);

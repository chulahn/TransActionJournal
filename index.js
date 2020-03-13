var express = require("express");
var app = express();

var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var databaseURL = "mongodb://admin:tajadmin1@ds125195.mlab.com:25195/eyecoin";
var ObjectId = require("mongodb").ObjectId;

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

app.get("/", function(req, res) {
  res.sendfile("index.html");
});

app.get("/css/index.css", function(req, res) {
  res.sendfile("css/index.css");
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
      console.log("app.get('/ex' : Connected to client");

      var db = client.db("exercise-journal"); // change to DB name
      var userCollection = db.collection("workouts"); // change to Collection name

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

app.get("/user/:userId", function(req, res) {
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.get('/ex' : Connected to client");

      var db = client.db("eyecoin");
      var transactionCollection = db.collection("users"); // Users does not exist yet.

      transactionCollection
        .find({ userId: userId })
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
app.post("/trans", function(req, res) {
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.post('/trans' : Connected to client");

      var db = client.db("eyecoin"); //change name
      var transactionCollection = db.collection("transactions"); //hcange name

      var passedTransObject = req.body;

      //get length of transaction collection
      passedTransObject.id = transactionCollection.count();

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
    } else {
      console.log("Error connecting to Database", err);
    }
  });
});

// Update a workout.  Called when Updating, or resyncing.  User is same.
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

// Create User
app.post("/register", function(req, res) {
  //First connect to the database,
  //Check if email is in use.  transform to lowercase, then find match
  //check username.  find match
  //Get length, assign Id to newUser
  //Add User to DB.
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.post('/register' :  Register");

      var db = client.db("exercise-journal");
      var userCollection = db.collection("users");
      console.log(req.body);
      //if invalid email is entered, body does not send it.

      var b = userCollection
        .find({
          email: req.body.email
        })
        .toArray(function(err, results) {
          var emailExists = results.length > 0;

          if (emailExists) {
            // cannot register
            //TODO: update client and give feedback that couldnt Register
            console.log(req.body.email, "exists");
            res.status(401).send("Email already Exists");
          } else {
            console.log("Checking if username in use");

            var d = userCollection
              .find({
                user_name: req.body.user_name
              })
              .toArray(function(err, dResults) {
                var userNameExists = dResults.length > 0;

                if (userNameExists) {
                  // cannot register
                  console.log(req.body.user_name, " user_name exists");
                  res.status(402).send("Email already Exists");
                } else {
                  var newUser = {};

                  userCollection.find({}).toArray(function(err, allUsers) {
                    newUser.id = allUsers.length;
                    newUser.user_name = req.body.user_name;
                    // TODO: Salt password
                    newUser.password = req.body.password;
                    newUser.email = req.body.email;
                    newUser.created = new Date();

                    userCollection.insert(newUser, function(
                      insertErr,
                      insertResults
                    ) {
                      if (insertErr) {
                        console.log("Insert workout error");
                        console.log(insertErr);
                        res.status(400).send(insertErr);
                      } else {
                        console.log("Successful insert");
                        console.log(insertResults);
                        //Redirect to logged in
                        res.send(req.body);
                      }
                    });
                  });
                }
                console.log(dResults, "dResults");
              });
          }
        });
    } else {
      console.log("Error connecting to Database");
      console.log(err);
    }
  });
});

app.listen(process.env.PORT || 3000);

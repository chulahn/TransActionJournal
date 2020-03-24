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
      var transactionCollection = db.collection("demo"); //hcange name

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

//Create User.
app.post("/register", function(req, res) {
  MongoClient.connect(databaseURL, function(err, client) {
    if (client) {
      console.log("app.post('/register' : Connected to client");

      var db = client.db("eyecoin"); //change name
      var userCollection = db.collection("users"); //hcange name

      var passedUserObject = req.body;
      passedUserObject.createdDate = new Date();

      console.log(passedUserObject);

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
    } else {
      console.log("Error connecting to Database", err);
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

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

app.get("/index.css", function(req, res) {
  res.sendfile("css/index.css");
});

app.get("/js/controller.js", function(req, res) {
  res.sendfile("js/controller.js");
});

app.listen(process.env.PORT || 3000);

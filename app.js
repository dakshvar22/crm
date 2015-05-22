var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , userlist = require('./routes/userlist')
  , newuser = require('./routes/newuser')
  , adduser = require('./routes/adduser')
  , changeuser = require('./routes/changeuser')
  , updateuser = require('./routes/updateuser')
  , remuser = require('./routes/remuser')
  , deleteuser = require('./routes/deleteuser')
  , http = require('http')
  , path = require('path');
  
  

var url = require('url');
var hbs = require('hbs');

hbs.registerHelper('raw-helper', function(options) {
  return options.fn();
});
var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();

var mongo = process.env.VCAP_SERVICES;
var port = process.env.PORT || 3030;
var conn_str = "";
if (mongo) {
  var env = JSON.parse(mongo);
  if (env['mongodb-2.4']) {
    mongo = env['mongodb-2.4'][0]['credentials'];
    if (mongo.url) {
      conn_str = mongo.url;
    } else {
      console.log("No mongo found");
    }  
  } else {
    conn_str = 'mongodb://localhost:27017';
  }
} else {
  conn_str = 'mongodb://localhost:27017/test';
}

var MongoClient = require('mongodb').MongoClient;
var db; 
MongoClient.connect(conn_str, function(err, database) {
  if(err) throw err;
  db = database;
}); 

var client = require('twilio')('AC23a1cb8cfa50c074ef2b1e734db0ce1b','9436917844249ca9c4300a55c07c8fd3');
//var phone = client.getPhoneNumber('+12195766594');


var app = express();
var output = {};
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('html', hbs.__express);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

// Invoke the appropriate Express middleware
app.get('/', routes.index);
app.get('/adduser', function(req,res){
	var url_parts = url.parse(req.url, true);
	var FirstName = url_parts.query.firstname;
	console.log(FirstName);
    var LastName = url_parts.query.lastname;
    var reportsTo = url_parts.query.report;
    var emailId = url_parts.query.email

    
    var collection = db.collection('users');

    collection.insert({
        "FirstName" : FirstName,
        "LastName" : LastName,
        "ReportsTo" : reportsTo,
        "EmailId" : emailId
    }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {
            //res.location("userlist");
            //res.redirect("userlist");
            res.render('index');
        }
    });
});
app.get('/getusers', function(req,res){
	client.sendSms({
    to:'+917259981090',
    from:'+13127560328',
    body:'ahoy hoy! Testing Twilio and node.js'
	}, function(error, message) {
    if (!error) {
        console.log('Success! The SID for this SMS message is:');
        console.log(message.sid);
		console.log('Message sent on:');
        console.log(message.dateCreated);
    } else {
        console.log('Oops! There was an error.');
    }
	});
	db.collection('users').find().toArray(function (err, items) {
        res.json(items);
    });
});
app.get('/deleteuser',function(req,res){
	var url_parts = url.parse(req.url, true);
	var name = url_parts.query.email;
	db.collection('users',function(err,collection){
    collection.remove({
        "EmailId": name
    },function(err, removed){
        console.log(removed);
    });
	});
	res.send('Deleted');
});

app.get('/api/sentiment',function(req,res,sentiment){
	var url_parts = url.parse(req.url, true);
	var text_raw = url_parts.query.text;
	console.log(text_raw);
	alchemyapi.sentiment('text', text_raw, {}, function(response) {
		output['sentiment'] = { text:text_raw, response:JSON.stringify(response,null,4), results:response['docSentiment'] };
		//text(req, res, output);
		console.log(response);
		res.json(response);
		//sentiment = JSON.stringify(response,null,4)
		//console.log(typeof sentiment);
	});
	
});


/*app.get('/users', user.list);
app.get('/helloworld', routes.index);
//app.get('/userlist', userlist.list);
app.get('/newuser', newuser.list);
app.post('/adduser',adduser.list);
app.get('/changeuser', changeuser.list);
app.post('/updateuser', updateuser.list);
app.get('/remuser', remuser.list);
app.post('/deleteuser',deleteuser.list);
*/
//app.get('/userlist',function(req,res){res.send
// Create Web server and listen on port 3000
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
module.exports=app;

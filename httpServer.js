//uczl203--the code here is adapted from https://github.com/claireellul/cegeg077-week5server/blob/master/httpServer.js

//use the following code to import the configuration information and convert it to the required JSON format.
//read in the file and force it to be a string by adding “” at the beginning
var fs = require('fs'); 
var configtext = ""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");

//now convert the configruation file into the correct format -i.e. a name/value pair array
var configarray = configtext.split(",");
var config = {};
for (var i = 0; i < configarray.length; i++) {
	var split = configarray[i].split(':');
	config[split[0].trim()] = split[1].trim();
}
	
//then import the required connectivity code & set up a database connection
var pg = require('pg');
var pool = new pg.Pool(config);
console.log(config);

//express is the server that forms part of the nodejs program 
var express = require('express'); 
var path = require("path"); 
var app = express(); 
//add bodyParser to process the uploaded data
var bodyParser = require('body-parser'); 

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

        // adding functionality to allow cross-domain queries when PhoneGap is running a server
	    app.use(function(req, res, next) {
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
			res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
			next();
			});

// note that we are using POST here as we are uploading data 	
// so the parameters form part of the BODY of the request rather than the RESTful API 		
app.post('/uploadData',function(req,res){ 
        console.dir(req.body); 
		
		pool.connect(function(err,client,done) { 
		if(err){ 
		        console.log("not able to get connection "+ err); 
				res.status(400).send(err); 
		}  
		
		//then pull all the geometry component toghether
		//the test requires the points as longitude/latitude
		//make sure the name after'req.body' is completely same with the name in PGAimIII&other files
		//the following code is adapted from Practical - Saving data to the server.pdf/Part7
		var geometrystring = "st_geomfromtext('POINT(" + req.body.longitude + " " + req.body.latitude + ")'";
		var querystring = "INSERT into formdata (question_id, question, answer_1, answer_2, answer_3, answer_4, correct_answer, location_name, geom) values ('"; 
		querystring = querystring + req.body.question_id + "','" + req.body.question + "','" + req.body.answer_1 + "','" + req.body.answer_2 + "','" + req.body.answer_3 + "','" + req.body.answer_4 + "','";
		querystring = querystring + req.body.correct_answer + "'," + req.body.location_name + "','" + geometrystring + "))";
		
		console.log(querystring);
		client.query( querystring,function(err,result) {
			done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send("row inserted");
		});
	});
});
			
			//adding functionality to log requests
			app.use(function (req, res, next) {
				var filename = path.basename(req.url);
				var extension = path.extname(filename);
				console.log("The file " + filename + " was requested.");
				next();
			});
			
			//next, add an httpServer tp serve files to the Edge browser
			//because of cerificate issues, it rejects the https files if they are not directly called in a typed URL
			var http = require('http');
			var httpServer = http.createServer(app); 
			httpServer.listen(4480);
			
			app.get('/',function (req,res) {
				res.send("Welcome to the Question-setting APP");
			});

//the following code is used to extract the data as GeoJSON from database 
//sometimes the data is not text but a map
app.get('/getquestionData', function (req,res) { 
     pool.connect(function(err,client,done) { 
	   if(err){ 
	       console.log("not able to get connection "+ err); 
		   res.status(400).send(err); 
	    }  
		
		//then create the required GeoJSON format
		//the following code is adapted from http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html
		//notice: query needs to be a single string with no line breaks
		var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM "; 
		querystring = querystring + "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.geom)::json As geometry, "; 
		querystring = querystring + "row_to_json((SELECT l FROM (SELECT question_id, question, answer_1, answer_2, answer_3, answer_4, correct_answer, location_name) As l      )) As properties"; 
		querystring = querystring + "   FROM questionform  As lg limit 100  ) As f "; 
		console.log(querystring); 
		client.query(querystring,function(err,result){
			 //call `done()` to release the client back to the pool 
			 done();  
			 if(err){ 
			     console.log(err); 
				 res.status(400).send(err); 
				 } 
			 res.status(200).send(result.rows); 
		}); 
	}); 
}); 

//the following code is used to upload the answer chosen by the user to "question_answers" database
app.get('/AnswerUpload', function (req,res) { 
     console.dir(req.body); 
     pool.connect(function(err,client,done) { 
	    if(err){ 
		        console.log("not able to get connection "+ err); 
				res.status(400).send(err); 
		}  
		//then use the inbuilt GeoJSON functionality
		//the following code is adaped from http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions
		var querystring = "INSERT into question_answers (question_id, question, answer, correct_answer) values ('"; 
		querystring = querystring + req.body.question_id + "','" + req.body.question + "','" + req.body.answer + "','" + req.body.correct_answer + "))";
		
		console.log(querystring);
		client.query(querystring,function(err,result) {
			done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send("Answer chosen have been submitted successfully!");
		});
	});
})

	//NOTE: The ORDER of things is really important here – if you put the code below after this app.get('/:name1/:name2/:name3/:name4', function (req, res) { code then then server will try and serve up a file rather than your data!
	//the / indicates the path that you type into the server
	//what happens when you type in: http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
	app.get('/:name1', function (req, res) {
		//run some server-side code
		//the console is the command line of your server - you will see the console.log values in the terminal window
		console.log('request '+req.params.name1);

		//the res is the response that the server sends back to the browser - you will see this text in your browser window
		res.sendFile(__dirname + '/'+req.params.name1);
		});
		
	//what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
	app.get('/:name1/:name2', function (req, res) {
		console.log('request '+req.params.name1+"/"+req.params.name2);
		res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2);
		});
		
	//what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
	app.get('/:name1/:name2/:name3', function (req, res) {
		console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3); 
		res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3);
		});
		
	//what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
	app.get('/:name1/:name2/:name3/:name4', function (req, res) {
		console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3+"/"+req.params.name4); 
		res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3+"/"+req.params.name4);
		});
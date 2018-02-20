var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', 'public')

app.get('/', (req,res) => {
  res.render('index.ejs')
})
app.listen(8080)
// http.createServer(function (req, res) {
//   fs.readFile('index.ejs', function(err, data) {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(data);
//     res.end();
//   });
// }).listen(8080);


/*
express = require('express');
bodyParser = require('body-parser');
app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('Hello World');
});

app.listen(8080, function(){
  console.log('Server started on port 8080');
})

*/

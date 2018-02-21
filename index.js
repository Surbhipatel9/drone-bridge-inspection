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

/*
function fillHomeTable(str){
  var xhttp;
  if(str == ""){
    document.getElementById("txtHint").innerHTML = "";
    return;
  }
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      document.getElementById("txtHint").innerHTML = 
      this.responseText;
  }
};
xhttp.open("GET", "index.ejs?q=" + str, true);
xhttp.send();
}
*/
app.listen(8080)


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

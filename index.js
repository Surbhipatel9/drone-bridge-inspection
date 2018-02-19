var http = require('http');
const db = require('./DB.js');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Hello World!');
    db.init();
    console.log("done");
}).listen(process.env.PORT || 5000);
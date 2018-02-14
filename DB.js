var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config = {
    userName: 'aksenov',
    password: 'Datapass123',
    server: 'droneinsp.database.windows.net', 
    options: 
        {
           database: 'DroneInspDB'
           , encrypt: true
        }
};

// connect to your database
var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on('connect', function(err) 
   {
     if (err) 
       {
          console.log(err)
       }
    else
       {
           console.log('Success!')
       }
   }
 );
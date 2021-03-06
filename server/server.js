"use strict";

var express = require("express");
var app = express();

var mysql = require('mysql');

var connection = null;
var dbConfig = getDbConfig();

console.dir(dbConfig);
handleDisconnect();

var PORT = process.env.PORT || 3000;

//app.use(express.static('./public'));

app.listen(PORT, function () {
    console.log("Server running on " + PORT);
});

app.get('/', function (request, response) {
    connection.query('SELECT * from Persons', function (err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['Hello World!!!!', rows]);
    });
});

function getDbConfig(){
    var dbConfig = null;
    var ISLOCAL = process.env.ISLOCAL || false;

    if(ISLOCAL){
        dbConfig = require("../private/dbConfig");
    } else{
        dbConfig = {
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        };
    }
    return dbConfig;
}

function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(dbConfig); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function (err) {              	// The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 1000); // We introduce a delay before attempting to reconnect,
        }                                     	// to avoid a hot loop, and to allow our node script to
    });                                     	// process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 	// Connection to the MySQL server is usually
            handleDisconnect();                      	// lost due to either server restart, or a
        } else {                                      	// connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}
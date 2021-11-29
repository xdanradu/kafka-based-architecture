var mysql = require("mysql");
var mysql = mysql.createPool({
    connectionLimit : 1000,
    port : "3306",
    host: "localhost",
    user : "root",
    password : "root",
    database : "grubhub"
});

module.exports = mysql;

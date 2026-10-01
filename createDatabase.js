require("dotenv").config();

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("Connected to MySQL");

  const sql = "CREATE DATABASE IF NOT EXISTS marketplace_db";

  connection.query(sql, (err) => {
    if (err) {
      console.error("Database creation failed:", err.message);
    } else {
      console.log("Database marketplace_db created successfully");
    }

    connection.end();
  });
});
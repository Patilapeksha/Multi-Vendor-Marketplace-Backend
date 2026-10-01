const db = require("./db");

const query = "DESCRIBE users";

db.query(query, (err, results) => {
  if (err) {
    console.error("Failed to check users table:", err);
    process.exit(1);
  }

  console.log("Users table structure:");
  console.table(results);

  process.exit(0);
});
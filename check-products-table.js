const db = require("./db");

const query = "DESCRIBE products";

db.query(query, (err, results) => {
  if (err) {
    console.error("Failed to check products table:", err);
    process.exit(1);
  }

  console.log("Products table structure:");
  console.table(results);

  process.exit(0);
});
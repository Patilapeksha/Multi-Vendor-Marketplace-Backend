const db = require("./db");

const query = "SELECT * FROM categories";

db.query(query, (err, results) => {
  if (err) {
    console.log("Failed to get categories:");
    console.log(err);
    process.exit(1);
  }

  console.log("Categories:");
  console.log(results);

  process.exit(0);
});
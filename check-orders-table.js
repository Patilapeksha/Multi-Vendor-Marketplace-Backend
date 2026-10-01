const db = require("./db");

const query = `DESCRIBE orders`;

db.query(query, (err, result) => {
  if (err) {
    console.error("Failed to check orders table:", err);
    process.exit(1);
  }

  console.table(result);
  process.exit(0);
});
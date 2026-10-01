const db = require("./db");

const query = `
  ALTER TABLE products
  ADD COLUMN stock INT NOT NULL DEFAULT 0
`;

db.query(query, (err, result) => {
  if (err) {
    console.error("Failed to add stock column:", err);
    process.exit(1);
  }

  console.log("Stock column added successfully!");
  console.log(result);

  process.exit(0);
});
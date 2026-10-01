const db = require("./db");

const query = `
ALTER TABLE users
ADD COLUMN vendor_status VARCHAR(30) NOT NULL DEFAULT 'pending'
`;

db.query(query, (err) => {
  if (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("vendor_status column already exists!");
      process.exit(0);
    }

    console.error("Failed to add vendor_status:", err);
    process.exit(1);
  }

  console.log("vendor_status column added successfully!");
  process.exit(0);
});
const db = require("./db");

const query = `
  SELECT id, name, email, role, vendor_status, is_active
  FROM users
  WHERE id = 5
`;

db.query(query, (err, results) => {
  if (err) {
    console.error("Failed to check Vendor 2:", err);
    process.exit(1);
  }

  console.table(results);
  process.exit(0);
});
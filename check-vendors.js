const db = require("./db");

const query = `
  SELECT
    id,
    name,
    email,
    role,
    is_active
  FROM users
  WHERE role = 'vendor'
`;

db.query(query, (err, results) => {
  if (err) {
    console.error("Failed to fetch vendors:", err);
    process.exit(1);
  }

  console.log("Vendor accounts:");
  console.table(results);

  process.exit(0);
});
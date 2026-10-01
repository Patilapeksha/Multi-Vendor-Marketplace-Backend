const db = require("./db");

const query = `
  SELECT
    id,
    name,
    email,
    role,
    vendor_status,
    is_active
  FROM users
  WHERE role = 'vendor'
  ORDER BY id;
`;

db.query(query, (err, results) => {
  if (err) {
    console.error("ERROR:");
    console.error(err);
    process.exit(1);
  }

  console.log("VENDORS:");
  console.log(JSON.stringify(results, null, 2));

  process.exit(0);
});
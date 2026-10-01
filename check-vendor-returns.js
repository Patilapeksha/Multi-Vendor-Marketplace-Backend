const db = require("./db");

const query = `
  SELECT
    id,
    order_id,
    buyer_id,
    vendor_id,
    reason,
    status
  FROM returns
  ORDER BY id DESC
`;

db.query(query, (err, rows) => {
  if (err) {
    console.error("Database error:", err);
    process.exit(1);
  }

  console.log("Returns in database:");
  console.table(rows);

  process.exit(0);
});
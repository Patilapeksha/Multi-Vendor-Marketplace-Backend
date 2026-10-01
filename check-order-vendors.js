const db = require("./db");

const query = `
  SELECT
    id,
    order_id,
    vendor_id,
    subtotal,
    status
  FROM vendor_orders
  ORDER BY order_id DESC
`;

db.query(query, (err, results) => {
  if (err) {
    console.error("Error:", err);
    process.exit(1);
  }

  console.log("\nVendor Orders:");
  console.table(results);

  process.exit(0);
});
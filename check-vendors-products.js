const db = require("./db");

const query = `
  SELECT
    products.id AS product_id,
    products.title,
    products.vendor_id,
    users.name AS vendor_name,
    users.email AS vendor_email
  FROM products
  JOIN users
    ON products.vendor_id = users.id
  WHERE users.role = 'vendor'
  ORDER BY products.id;
`;

db.query(query, (err, results) => {
  if (err) {
    console.error("Failed to fetch vendor products:", err);
    process.exit(1);
  }

  console.log("Vendor products:");
  console.table(results);

  process.exit(0);
});
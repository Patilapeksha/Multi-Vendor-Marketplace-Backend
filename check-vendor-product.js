const db = require("./db");

const query = `
  SELECT
    products.id AS product_id,
    products.title,
    products.vendor_id,
    users.name AS vendor_name,
    users.email AS vendor_email,
    users.role
  FROM products
  JOIN users
    ON products.vendor_id = users.id
  WHERE products.id = 1
`;

db.query(query, (err, results) => {
  if (err) {
    console.error("Failed to check vendor product:", err);
    process.exit(1);
  }

  console.log("Product 1 vendor details:");
  console.table(results);

  process.exit(0);
});
const db = require("./db");

const productId = 1;

const query = `
  SELECT
    product_id,
    stock_quantity,
    low_stock_threshold
  FROM inventory
  WHERE product_id = ?
`;

db.query(query, [productId], (err, results) => {
  if (err) {
    console.error("Failed to check stock:", err);
    process.exit(1);
  }

  console.log("Product 1 Inventory:");
  console.log(results);

  process.exit(0);
});
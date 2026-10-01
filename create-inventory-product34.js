const db = require("./db");

const query = `
  INSERT INTO inventory
  (product_id, stock_quantity, low_stock_threshold)
  VALUES (?, ?, ?)
`;

db.query(query, [34, 0, 5], (err, result) => {
  if (err) {
    console.error("Failed to create inventory:", err);
    process.exit(1);
  }

  console.log("Inventory created successfully for Product 34!");
  console.log("Inventory ID:", result.insertId);

  process.exit(0);
});
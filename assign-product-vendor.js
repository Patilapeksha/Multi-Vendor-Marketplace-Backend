const db = require("./db");

const vendorId = 2;
const productId = 1;

const query = `
  UPDATE products
  SET vendor_id = ?
  WHERE id = ?
`;

db.query(query, [vendorId, productId], (err, result) => {
  if (err) {
    console.error("Failed to assign product to vendor:", err);
    process.exit(1);
  }

  if (result.affectedRows === 0) {
    console.log("Product not found.");
    process.exit(1);
  }

  console.log(
    `Product ${productId} successfully assigned to vendor ${vendorId}!`
  );

  process.exit(0);
});
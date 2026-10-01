const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_user_product (user_id, product_id),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
`;

db.query(query, (err, result) => {
  if (err) {
    console.error("Failed to create cart_items table:", err);
    process.exit(1);
  }

  console.log("cart_items table created successfully!");
  process.exit(0);
});
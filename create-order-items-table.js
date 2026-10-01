const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);
`;

db.query(query, (err, result) => {
  if (err) {
    console.error("Failed to create order_items table:", err);
    process.exit(1);
  }

  console.log("order_items table created successfully!");
  process.exit(0);
});
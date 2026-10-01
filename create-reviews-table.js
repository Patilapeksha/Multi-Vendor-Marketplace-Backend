const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    FOREIGN KEY (buyer_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_buyer_product (
        buyer_id,
        product_id
    ),

    CHECK (rating >= 1 AND rating <= 5)
);
`;

db.query(query, (err) => {
  if (err) {
    console.error("Error creating reviews table:", err);
    process.exit(1);
  }

  console.log("reviews table created successfully.");
  process.exit(0);
});
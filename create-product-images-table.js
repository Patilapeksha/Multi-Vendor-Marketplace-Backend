const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);
`;

db.query(query, (err) => {
  if (err) {
    console.error("Error creating product_images table:", err);
    process.exit(1);
  }

  console.log("product_images table created successfully.");
  process.exit(0);
});
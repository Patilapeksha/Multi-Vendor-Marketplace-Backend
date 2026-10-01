const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    variant_value VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_product_variant
        (product_id, variant_name, variant_value)
);
`;

db.query(query, (err) => {
  if (err) {
    console.error(
      "Failed to create product_variants table:",
      err
    );
    process.exit(1);
  }

  console.log(
    "product_variants table created successfully."
  );

  process.exit(0);
});
const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
`;

db.query(query, (err, result) => {
  if (err) {
    console.error("Failed to create orders table:", err);
    process.exit(1);
  }

  console.log("orders table created successfully!");
  process.exit(0);
});
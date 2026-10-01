const db = require("./db");

const query = `
  CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM(
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled'
    ) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  )
`;

db.query(query, (err, result) => {
  if (err) {
    console.error("Failed to create orders table:", err);
    process.exit(1);
  }

  console.log("Orders table created successfully!");
  console.log(result);

  process.exit(0);
});
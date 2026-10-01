const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    buyer_id INT NOT NULL,

    vendor_id INT NOT NULL,

    reason VARCHAR(255) NOT NULL,

    description TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'open',

    resolution VARCHAR(50),

    refund_amount DECIMAL(10,2) DEFAULT 0.00,

    admin_note TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    FOREIGN KEY (buyer_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (vendor_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
`;

db.query(query, (err) => {
  if (err) {
    console.error(
      "Failed to create disputes table:",
      err
    );
    process.exit(1);
  }

  console.log(
    "Disputes table created successfully."
  );

  process.exit(0);
});
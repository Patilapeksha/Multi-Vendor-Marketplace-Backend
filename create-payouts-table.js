const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,

    vendor_id INT NOT NULL,

    order_id INT NOT NULL,

    order_amount DECIMAL(10,2) NOT NULL,

    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,

    commission_amount DECIMAL(10,2) NOT NULL,

    payout_amount DECIMAL(10,2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    payment_reference VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (vendor_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);
`;

db.query(query, (err) => {
  if (err) {
    console.error(
      "Failed to create payouts table:",
      err
    );
    process.exit(1);
  }

  console.log(
    "payouts table created successfully!"
  );

  process.exit(0);
});
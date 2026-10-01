const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS commission_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,

    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,

    updated_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);
`;

db.query(query, (err) => {
  if (err) {
    console.error(
      "Failed to create commission settings table:",
      err
    );

    process.exit(1);
  }

  console.log(
    "commission_settings table created successfully!"
  );

  // Insert default commission setting
  const insertQuery = `
    INSERT INTO commission_settings
    (commission_rate)
    SELECT 10.00
    WHERE NOT EXISTS (
      SELECT 1
      FROM commission_settings
    )
  `;

  db.query(insertQuery, (insertErr) => {
    if (insertErr) {
      console.error(
        "Failed to insert default commission setting:",
        insertErr
      );

      process.exit(1);
    }

    console.log(
      "Default commission rate set to 10%."
    );

    process.exit(0);
  });
});
const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);
`;

db.query(query, (err, result) => {
  if (err) {
    console.error("Failed to create audit_logs table:", err);
    process.exit(1);
  }

  console.log("audit_logs table created successfully.");
  process.exit(0);
});
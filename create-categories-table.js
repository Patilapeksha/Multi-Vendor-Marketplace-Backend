const db = require("./db");

const query = `
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(query, (err) => {
  if (err) {
    console.error("Failed to create categories table:", err);
    process.exit(1);
  }

  console.log("categories table created successfully!");
  process.exit(0);
});
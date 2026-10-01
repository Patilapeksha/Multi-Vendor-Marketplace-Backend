const db = require("./db");

const query = `
  SELECT id, name, email, role
  FROM users
  ORDER BY id
`;

db.query(query, (err, users) => {
  if (err) {
    console.error("Failed to fetch users:", err);
    process.exit(1);
  }

  console.log("Users:");
  console.table(users);

  process.exit(0);
});
const db = require("./db");

const query = `
  SELECT *
  FROM audit_logs
  ORDER BY id DESC
`;

db.query(query, (err, results) => {
  if (err) {
    console.error("Failed to fetch audit logs:", err);
    process.exit(1);
  }

  console.log("\nAUDIT LOG DATA:");
  console.table(results);

  process.exit(0);
});
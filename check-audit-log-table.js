const db = require("./db");

const query = `
  DESCRIBE audit_logs
`;

db.query(query, (err, results) => {
  if (err) {
    console.error(
      "Failed to check audit_logs table:",
      err
    );

    process.exit(1);
  }

  console.log("\nAUDIT_LOGS TABLE:");
  console.table(results);

  process.exit(0);
});
const db = require("./db");

const vendorId = 2;

const query = `
  SELECT
    r.id,
    r.order_id,
    r.buyer_id,
    buyer.email AS buyer_email,
    r.vendor_id,
    r.reason,
    r.description,
    r.status,
    r.refund_amount,
    r.admin_note,
    r.created_at,
    r.updated_at
  FROM returns r
  JOIN users buyer
    ON r.buyer_id = buyer.id
  WHERE r.vendor_id = ?
  ORDER BY r.created_at DESC
`;

db.query(query, [vendorId], (err, rows) => {
  if (err) {
    console.error("Query error:", err);
    process.exit(1);
  }

  console.log("Vendor ID:", vendorId);
  console.log("Rows found:", rows.length);
  console.table(rows);

  process.exit(0);
});
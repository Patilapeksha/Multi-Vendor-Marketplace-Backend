const db = require("./db");

const orderId = 1;

console.log("Checking payout data for Order 1...");

const query = `
  SELECT
    vo.order_id,
    vo.vendor_id,
    vo.subtotal,
    cs.commission_rate
  FROM vendor_orders vo
  CROSS JOIN (
    SELECT commission_rate
    FROM commission_settings
    ORDER BY id DESC
    LIMIT 1
  ) cs
  WHERE vo.order_id = ?
`;

db.query(query, [orderId], (err, results) => {
  if (err) {
    console.error("\nDATABASE ERROR:");
    console.error(err);
    process.exit(1);
  }

  console.log("\nPayout data:");
  console.table(results);

  if (results.length === 0) {
    console.log("No vendor order found.");
    process.exit(0);
  }

  const row = results[0];

  const orderAmount = Number(row.subtotal);
  const commissionRate = Number(row.commission_rate);

  const commissionAmount = Number(
    (
      orderAmount * commissionRate / 100
    ).toFixed(2)
  );

  const payoutAmount = Number(
    (
      orderAmount - commissionAmount
    ).toFixed(2)
  );

  console.log("\nCalculated values:");
  console.log("Order Amount:", orderAmount);
  console.log("Commission Rate:", commissionRate);
  console.log("Commission Amount:", commissionAmount);
  console.log("Payout Amount:", payoutAmount);

  const insertQuery = `
    INSERT INTO payouts
    (
      vendor_id,
      order_id,
      order_amount,
      commission_rate,
      commission_amount,
      payout_amount,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;

  db.query(
    insertQuery,
    [
      row.vendor_id,
      row.order_id,
      orderAmount,
      commissionRate,
      commissionAmount,
      payoutAmount
    ],
    (insertErr, result) => {
      if (insertErr) {
        console.error("\nPAYOUT INSERT ERROR:");
        console.error(insertErr);
        process.exit(1);
      }

      console.log("\nPAYOUT INSERT SUCCESS!");
      console.log("Payout ID:", result.insertId);

      process.exit(0);
    }
  );
});
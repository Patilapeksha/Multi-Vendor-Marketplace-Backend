const db = require("../../db");

const generatePayoutsForOrder = (orderId, callback) => {
  // Get latest commission rate
  const commissionQuery = `
    SELECT commission_rate
    FROM commission_settings
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(
    commissionQuery,
    (commissionErr, commissionResults) => {
      if (commissionErr) {
        console.error(
          "Commission lookup error:",
          commissionErr
        );

        return callback(commissionErr);
      }

      if (commissionResults.length === 0) {
        return callback(
          new Error("Commission setting not found")
        );
      }

      const commissionRate = Number(
        commissionResults[0].commission_rate
      );

      // Get vendor orders
      const vendorOrdersQuery = `
        SELECT
          id,
          order_id,
          vendor_id,
          subtotal
        FROM vendor_orders
        WHERE order_id = ?
      `;

      db.query(
        vendorOrdersQuery,
        [orderId],
        (vendorErr, vendorOrders) => {
          if (vendorErr) {
            console.error(
              "Vendor order lookup error:",
              vendorErr
            );

            return callback(vendorErr);
          }

          if (vendorOrders.length === 0) {
            return callback(
              new Error(
                "No vendor orders found for this order"
              )
            );
          }

          let completed = 0;
          let firstError = null;

          vendorOrders.forEach((vendorOrder) => {
            const orderAmount =
              Number(vendorOrder.subtotal);

            const commissionAmount = Number(
              (
                orderAmount *
                commissionRate /
                100
              ).toFixed(2)
            );

            const payoutAmount = Number(
              (
                orderAmount -
                commissionAmount
              ).toFixed(2)
            );

            // Check whether payout already exists
            const checkQuery = `
              SELECT id
              FROM payouts
              WHERE vendor_id = ?
                AND order_id = ?
              LIMIT 1
            `;

            db.query(
              checkQuery,
              [
                vendorOrder.vendor_id,
                orderId
              ],
              (checkErr, existingPayout) => {
                if (checkErr) {
                  console.error(
                    "Payout check error:",
                    checkErr
                  );

                  if (!firstError) {
                    firstError = checkErr;
                  }

                  completed++;

                  if (
                    completed ===
                    vendorOrders.length
                  ) {
                    callback(firstError);
                  }

                  return;
                }

                // Payout already exists
                if (existingPayout.length > 0) {
                  completed++;

                  if (
                    completed ===
                    vendorOrders.length
                  ) {
                    callback(firstError);
                  }

                  return;
                }

                // Create payout
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
                    vendorOrder.vendor_id,
                    orderId,
                    orderAmount,
                    commissionRate,
                    commissionAmount,
                    payoutAmount
                  ],
                  (insertErr) => {
                    if (insertErr) {
                      console.error(
                        "Payout insert error:",
                        insertErr
                      );

                      if (!firstError) {
                        firstError = insertErr;
                      }
                    }

                    completed++;

                    if (
                      completed ===
                      vendorOrders.length
                    ) {
                      callback(firstError);
                    }
                  }
                );
              }
            );
          });
        }
      );
    }
  );
};

module.exports = {
  generatePayoutsForOrder
};
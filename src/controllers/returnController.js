const db = require("../../db");

// CREATE RETURN REQUEST - BUYER
const createReturn = (req, res) => {
  const buyerId = req.user.id;
  const orderId = Number(req.body.order_id);
  const vendorId = Number(req.body.vendor_id);
  const { reason, description } = req.body;

  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    return res.status(400).json({
      message: "Valid order ID is required"
    });
  }

  if (
    !Number.isInteger(vendorId) ||
    vendorId <= 0
  ) {
    return res.status(400).json({
      message: "Valid vendor ID is required"
    });
  }

  if (
    !reason ||
    typeof reason !== "string" ||
    !reason.trim()
  ) {
    return res.status(400).json({
      message: "Return reason is required"
    });
  }

  // Verify that the order belongs to the buyer
  // and the vendor is part of that order.
  const verifyQuery = `
    SELECT
      vendor_orders.id AS vendor_order_id,
      vendor_orders.subtotal,
      vendor_orders.vendor_id
    FROM orders

    JOIN vendor_orders
      ON orders.id = vendor_orders.order_id

    WHERE orders.id = ?
      AND orders.user_id = ?
      AND vendor_orders.vendor_id = ?
  `;

  db.query(
    verifyQuery,
    [orderId, buyerId, vendorId],
    (err, rows) => {
      if (err) {
        console.error(
          "Return verification error:",
          err
        );

        return res.status(500).json({
          message:
            "Failed to verify order"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            "Order not found or vendor does not belong to this order"
        });
      }

      const refundAmount =
        Number(rows[0].subtotal);

      const insertQuery = `
        INSERT INTO returns
        (
          order_id,
          buyer_id,
          vendor_id,
          reason,
          description,
          status,
          refund_amount
        )
        VALUES (?, ?, ?, ?, ?, 'requested', ?)
      `;

      db.query(
        insertQuery,
        [
          orderId,
          buyerId,
          vendorId,
          reason.trim(),
          description
            ? description.trim()
            : null,
          refundAmount
        ],
        (err, result) => {
          if (err) {
            console.error(
              "Create return error:",
              err
            );

            return res.status(500).json({
              message:
                "Failed to create return request"
            });
          }

          res.status(201).json({
            message:
              "Return request created successfully",

            return_id:
              result.insertId,

            order_id:
              orderId,

            vendor_id:
              vendorId,

            refund_amount:
              refundAmount,

            status:
              "requested"
          });
        }
      );
    }
  );
};


// GET BUYER RETURNS
const getMyReturns = (req, res) => {
  const buyerId = req.user.id;

  const query = `
    SELECT
      returns.id,
      returns.order_id,
      returns.vendor_id,
      returns.reason,
      returns.description,
      returns.status,
      returns.refund_amount,
      returns.admin_note,
      returns.created_at,
      returns.updated_at
    FROM returns
    WHERE returns.buyer_id = ?
    ORDER BY returns.created_at DESC
  `;

  db.query(
    query,
    [buyerId],
    (err, returns) => {
      if (err) {
        console.error(
          "Get buyer returns error:",
          err
        );

        return res.status(500).json({
          message:
            "Failed to fetch returns"
        });
      }

      res.status(200).json({
        message:
          "Returns fetched successfully",
        returns
      });
    }
  );
};


// GET SINGLE RETURN - BUYER
const getReturnById = (req, res) => {
  const buyerId = req.user.id;
  const returnId = Number(req.params.id);

  if (
    !Number.isInteger(returnId) ||
    returnId <= 0
  ) {
    return res.status(400).json({
      message: "Invalid return ID"
    });
  }

  const query = `
    SELECT
      id,
      order_id,
      vendor_id,
      reason,
      description,
      status,
      refund_amount,
      admin_note,
      created_at,
      updated_at
    FROM returns
    WHERE id = ?
      AND buyer_id = ?
  `;

  db.query(
    query,
    [returnId, buyerId],
    (err, rows) => {
      if (err) {
        console.error(
          "Get return error:",
          err
        );

        return res.status(500).json({
          message:
            "Failed to fetch return"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Return not found"
        });
      }

      res.status(200).json({
        message:
          "Return fetched successfully",
        return: rows[0]
      });
    }
  );
};


// CANCEL RETURN REQUEST - BUYER
const cancelReturn = (req, res) => {
  const buyerId = req.user.id;
  const returnId = Number(req.params.id);

  if (
    !Number.isInteger(returnId) ||
    returnId <= 0
  ) {
    return res.status(400).json({
      message: "Invalid return ID"
    });
  }

  const findQuery = `
    SELECT
      id,
      status
    FROM returns
    WHERE id = ?
      AND buyer_id = ?
  `;

  db.query(
    findQuery,
    [returnId, buyerId],
    (err, rows) => {
      if (err) {
        console.error(
          "Find return error:",
          err
        );

        return res.status(500).json({
          message:
            "Failed to find return"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Return not found"
        });
      }

      if (
        rows[0].status !== "requested"
      ) {
        return res.status(400).json({
          message:
            "Only requested returns can be cancelled"
        });
      }

      const updateQuery = `
        UPDATE returns
        SET status = 'cancelled'
        WHERE id = ?
          AND buyer_id = ?
      `;

      db.query(
        updateQuery,
        [returnId, buyerId],
        (err) => {
          if (err) {
            console.error(
              "Cancel return error:",
              err
            );

            return res.status(500).json({
              message:
                "Failed to cancel return"
            });
          }

          res.status(200).json({
            message:
              "Return request cancelled successfully",
            return_id:
              returnId,
            status:
              "cancelled"
          });
        }
      );
    }
  );
};


module.exports = {
  createReturn,
  getMyReturns,
  getReturnById,
  cancelReturn
};
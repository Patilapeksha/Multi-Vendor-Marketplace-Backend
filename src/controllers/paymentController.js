const db = require("../../db");
const crypto = require("crypto");

// CREATE MOCK PAYMENT
const createPayment = (req, res) => {
  const userId = req.user.id;
  const { order_id, payment_method } = req.body;

  if (!order_id) {
    return res.status(400).json({
      message: "Order ID is required"
    });
  }

  const method = payment_method || "mock";

  // Check that the order belongs to the logged-in buyer
  const orderQuery = `
    SELECT id, user_id, total_amount, status
    FROM orders
    WHERE id = ? AND user_id = ?
  `;

  db.query(
    orderQuery,
    [order_id, userId],
    (err, orders) => {
      if (err) {
        console.error("Order lookup error:", err);

        return res.status(500).json({
          message: "Failed to verify order"
        });
      }

      if (orders.length === 0) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      const order = orders[0];

      // Don't allow payment for an already cancelled order
      if (order.status === "cancelled") {
        return res.status(400).json({
          message: "Cannot pay for a cancelled order"
        });
      }

      // Check if payment already exists
      const existingPaymentQuery = `
        SELECT
          id,
          order_id,
          payment_reference,
          amount,
          status,
          payment_method,
          created_at
        FROM payments
        WHERE order_id = ?
      `;

      db.query(
        existingPaymentQuery,
        [order_id],
        (err, existingPayments) => {
          if (err) {
            console.error(
              "Payment lookup error:",
              err
            );

            return res.status(500).json({
              message: "Failed to check existing payment"
            });
          }

          if (existingPayments.length > 0) {
            return res.status(400).json({
              message: "Payment already exists for this order",
              payment: existingPayments[0]
            });
          }

          // Generate mock payment reference
          const paymentReference =
            "MOCK-" +
            crypto.randomBytes(8).toString("hex").toUpperCase();

          const paymentQuery = `
            INSERT INTO payments
            (
              order_id,
              payment_reference,
              amount,
              status,
              payment_method
            )
            VALUES (?, ?, ?, 'pending', ?)
          `;

          db.query(
                    paymentQuery,
                [
                     order_id,
                     paymentReference,
                     order.total_amount,
                     method
                 ],
            (err, paymentResult) => {
              if (err) {
                console.error(
                  "Payment creation error:",
                  err
                );

                return res.status(500).json({
                  message: "Failed to create payment"
                });
              }

              res.status(201).json({
                message: "Mock payment created successfully",
                payment_id: paymentResult.insertId,
                order_id: order.id,
                amount: order.total_amount,
                payment_reference: paymentReference,
                payment_method: method,
                status: "pending"
              });
            }
          );
        }
      );
    }
  );
};


// MOCK PAYMENT WEBHOOK
const paymentWebhook = (req, res) => {
  const {
    payment_reference,
    payment_status
  } = req.body;

  if (!payment_reference) {
    return res.status(400).json({
      message: "Payment reference is required"
    });
  }

  const allowedStatuses = [
    "success",
    "failed"
  ];

  if (!payment_status) {
    return res.status(400).json({
      message: "Payment status is required"
    });
  }

  if (!allowedStatuses.includes(payment_status)) {
    return res.status(400).json({
      message: "Invalid payment status",
      allowed_statuses: allowedStatuses
    });
  }

  const paymentQuery = `
    SELECT
      id,
      order_id,
      amount,
      status
    FROM payments
    WHERE payment_reference = ?
  `;

  db.query(
    paymentQuery,
    [payment_reference],
    (err, payments) => {
      if (err) {
        console.error(
          "Payment lookup error:",
          err
        );

        return res.status(500).json({
          message: "Failed to find payment"
        });
      }

      if (payments.length === 0) {
        return res.status(404).json({
          message: "Payment not found"
        });
      }

      const payment = payments[0];

      // Prevent changing a completed payment
      if (
        payment.status === "success" ||
        payment.status === "failed"
      ) {
        return res.status(400).json({
          message: "Payment has already been processed",
          status: payment.status
        });
      }

      const updatePaymentQuery = `
        UPDATE payments
        SET status = ?
        WHERE id = ?
      `;

      db.query(
        updatePaymentQuery,
        [payment_status, payment.id],
        (err) => {
          if (err) {
            console.error(
              "Payment update error:",
              err
            );

            return res.status(500).json({
              message: "Failed to update payment"
            });
          }

          // If payment succeeded, confirm the order
          if (payment_status === "success") {
            const updateOrderQuery = `
              UPDATE orders
              SET status = 'confirmed'
              WHERE id = ?
            `;

            db.query(
              updateOrderQuery,
              [payment.order_id],
              (err) => {
                if (err) {
                  console.error(
                    "Order confirmation error:",
                    err
                  );

                  return res.status(500).json({
                    message:
                      "Payment succeeded but order confirmation failed"
                  });
                }

                return res.status(200).json({
                  message:
                    "Payment successful and order confirmed",
                  payment_reference,
                  payment_status: "success",
                  order_id: payment.order_id,
                  order_status: "confirmed"
                });
              }
            );

            return;
          }

          // Failed payment
          res.status(200).json({
            message: "Payment failed",
            payment_reference,
            payment_status: "failed",
            order_id: payment.order_id
          });
        }
      );
    }
  );
};


// GET PAYMENT BY ORDER
const getPaymentByOrder = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.orderId;

  const query = `
    SELECT
      payments.id,
      payments.order_id,
      payments.payment_reference,
      payments.amount,
      payments.status,
      payments.payment_method,
      payments.created_at,
      payments.updated_at
    FROM payments
    JOIN orders
      ON payments.order_id = orders.id
    WHERE payments.order_id = ?
      AND orders.user_id = ?
  `;

  db.query(
    query,
    [orderId, userId],
    (err, payments) => {
      if (err) {
        console.error(
          "Get payment error:",
          err
        );

        return res.status(500).json({
          message: "Failed to fetch payment"
        });
      }

      if (payments.length === 0) {
        return res.status(404).json({
          message: "Payment not found"
        });
      }

      res.status(200).json({
        message: "Payment fetched successfully",
        payment: payments[0]
      });
    }
  );
};


module.exports = {
  createPayment,
  paymentWebhook,
  getPaymentByOrder
};
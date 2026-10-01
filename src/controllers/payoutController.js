const db = require("../../db");

// ==========================================
// GET ALL PAYOUTS - ADMIN
// ==========================================

const getAllPayouts = (req, res) => {
  const query = `
    SELECT
      payouts.id,
      payouts.vendor_id,
      users.name AS vendor_name,
      users.email AS vendor_email,
      payouts.order_id,
      payouts.order_amount,
      payouts.commission_rate,
      payouts.commission_amount,
      payouts.payout_amount,
      payouts.status,
      payouts.payment_reference,
      payouts.created_at,
      payouts.updated_at
    FROM payouts
    JOIN users
      ON payouts.vendor_id = users.id
    ORDER BY payouts.created_at DESC
  `;

  db.query(query, (err, payouts) => {
    if (err) {
      console.error("Get payouts error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch payouts"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payouts fetched successfully",
      payouts
    });
  });
};


// ==========================================
// GET SINGLE PAYOUT - ADMIN
// ==========================================

const getPayoutById = (req, res) => {
  const payoutId = Number(req.params.id);

  if (
    !Number.isInteger(payoutId) ||
    payoutId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid payout ID"
    });
  }

  const query = `
    SELECT
      payouts.id,
      payouts.vendor_id,
      users.name AS vendor_name,
      users.email AS vendor_email,
      payouts.order_id,
      payouts.order_amount,
      payouts.commission_rate,
      payouts.commission_amount,
      payouts.payout_amount,
      payouts.status,
      payouts.payment_reference,
      payouts.created_at,
      payouts.updated_at
    FROM payouts
    JOIN users
      ON payouts.vendor_id = users.id
    WHERE payouts.id = ?
  `;

  db.query(
    query,
    [payoutId],
    (err, payouts) => {
      if (err) {
        console.error(
          "Get payout error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch payout"
        });
      }

      if (payouts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Payout not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payout fetched successfully",
        payout: payouts[0]
      });
    }
  );
};


// ==========================================
// UPDATE PAYOUT STATUS - ADMIN
// ==========================================

const updatePayoutStatus = (req, res) => {
  const payoutId = Number(req.params.id);

  const {
    status,
    payment_reference
  } = req.body;

  // Validate payout ID
  if (
    !Number.isInteger(payoutId) ||
    payoutId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid payout ID"
    });
  }

  // Allowed payout statuses
  const allowedStatuses = [
    "pending",
    "processing",
    "paid",
    "failed"
  ];

  if (
    typeof status !== "string" ||
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Status must be pending, processing, paid, or failed"
    });
  }

  // Validate payment reference
  if (
    payment_reference !== undefined &&
    payment_reference !== null &&
    typeof payment_reference !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Payment reference must be a string"
    });
  }

  const query = `
    UPDATE payouts
    SET
      status = ?,
      payment_reference = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      status,
      payment_reference || null,
      payoutId
    ],
    (err, result) => {
      if (err) {
        console.error(
          "Update payout status error:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to update payout status"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Payout not found"
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Payout status updated successfully"
      });
    }
  );
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

// ==========================================
// GET MY PAYOUTS - VENDOR
// ==========================================

const getMyPayouts = (req, res) => {
  const vendorId = req.user.id;

  const query = `
    SELECT
      payouts.id,
      payouts.vendor_id,
      payouts.order_id,
      payouts.order_amount,
      payouts.commission_rate,
      payouts.commission_amount,
      payouts.payout_amount,
      payouts.status,
      payouts.payment_reference,
      payouts.created_at,
      payouts.updated_at
    FROM payouts
    WHERE payouts.vendor_id = ?
    ORDER BY payouts.created_at DESC
  `;

  db.query(
    query,
    [vendorId],
    (err, payouts) => {
      if (err) {
        console.error(
          "Get vendor payouts error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch vendor payouts"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Vendor payouts fetched successfully",
        payouts
      });
    }
  );
};

module.exports = {
  getAllPayouts,
  getPayoutById,
  updatePayoutStatus,
  getMyPayouts
};
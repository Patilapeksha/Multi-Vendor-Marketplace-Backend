const db = require("../../db");

// ==========================================
// CREATE DISPUTE - BUYER
// ==========================================

const createDispute = (req, res) => {
  const buyerId = req.user.id;

  const {
    order_id,
    vendor_id,
    reason,
    description
  } = req.body;

  const orderId = Number(order_id);
  const vendorId = Number(vendor_id);

  // Validation
  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid order ID"
    });
  }

  if (
    !Number.isInteger(vendorId) ||
    vendorId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid vendor ID"
    });
  }

  if (
    typeof reason !== "string" ||
    reason.trim().length === 0 ||
    reason.trim().length > 255
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Reason is required and must be 255 characters or less"
    });
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Description must be a string"
    });
  }

  // Verify order belongs to buyer and vendor order exists
  const verifyQuery = `
    SELECT
      orders.id AS order_id,
      vendor_orders.vendor_id
    FROM orders
    JOIN vendor_orders
      ON orders.id = vendor_orders.order_id
    WHERE orders.id = ?
      AND orders.user_id = ?
      AND vendor_orders.vendor_id = ?
    LIMIT 1
  `;

  db.query(
    verifyQuery,
    [orderId, buyerId, vendorId],
    (verifyErr, results) => {
      if (verifyErr) {
        console.error(
          "Verify dispute order error:",
          verifyErr
        );

        return res.status(500).json({
          success: false,
          message: "Failed to verify order"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found or vendor does not belong to this order"
        });
      }

      // Check duplicate open dispute
      const duplicateQuery = `
        SELECT id
        FROM disputes
        WHERE order_id = ?
          AND buyer_id = ?
          AND vendor_id = ?
          AND status IN ('open', 'under_review')
        LIMIT 1
      `;

      db.query(
        duplicateQuery,
        [orderId, buyerId, vendorId],
        (duplicateErr, existing) => {
          if (duplicateErr) {
            console.error(
              "Duplicate dispute check error:",
              duplicateErr
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to check existing dispute"
            });
          }

          if (existing.length > 0) {
            return res.status(409).json({
              success: false,
              message:
                "An active dispute already exists for this order"
            });
          }

          const insertQuery = `
            INSERT INTO disputes
            (
              order_id,
              buyer_id,
              vendor_id,
              reason,
              description
            )
            VALUES (?, ?, ?, ?, ?)
          `;

          db.query(
            insertQuery,
            [
              orderId,
              buyerId,
              vendorId,
              reason.trim(),
              description || null
            ],
            (insertErr, result) => {
              if (insertErr) {
                console.error(
                  "Create dispute error:",
                  insertErr
                );

                return res.status(500).json({
                  success: false,
                  message: "Failed to create dispute"
                });
              }

              return res.status(201).json({
                success: true,
                message:
                  "Dispute created successfully",
                dispute_id: result.insertId
              });
            }
          );
        }
      );
    }
  );
};


// ==========================================
// GET MY DISPUTES - BUYER
// ==========================================

const getMyDisputes = (req, res) => {
  const buyerId = req.user.id;

  const query = `
    SELECT
      disputes.id,
      disputes.order_id,
      disputes.vendor_id,
      users.name AS vendor_name,
      users.email AS vendor_email,
      disputes.reason,
      disputes.description,
      disputes.status,
      disputes.resolution,
      disputes.refund_amount,
      disputes.admin_note,
      disputes.created_at,
      disputes.updated_at
    FROM disputes
    JOIN users
      ON disputes.vendor_id = users.id
    WHERE disputes.buyer_id = ?
    ORDER BY disputes.created_at DESC
  `;

  db.query(
    query,
    [buyerId],
    (err, disputes) => {
      if (err) {
        console.error(
          "Get buyer disputes error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch disputes"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Disputes fetched successfully",
        disputes
      });
    }
  );
};


// ==========================================
// GET MY DISPUTES - VENDOR
// ==========================================

const getVendorDisputes = (req, res) => {
  const vendorId = req.user.id;

  const query = `
    SELECT
      disputes.id,
      disputes.order_id,
      disputes.buyer_id,
      users.name AS buyer_name,
      users.email AS buyer_email,
      disputes.reason,
      disputes.description,
      disputes.status,
      disputes.resolution,
      disputes.refund_amount,
      disputes.admin_note,
      disputes.created_at,
      disputes.updated_at
    FROM disputes
    JOIN users
      ON disputes.buyer_id = users.id
    WHERE disputes.vendor_id = ?
    ORDER BY disputes.created_at DESC
  `;

  db.query(
    query,
    [vendorId],
    (err, disputes) => {
      if (err) {
        console.error(
          "Get vendor disputes error:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch vendor disputes"
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Vendor disputes fetched successfully",
        disputes
      });
    }
  );
};


// ==========================================
// GET ALL DISPUTES - ADMIN
// ==========================================

const getAllDisputes = (req, res) => {
  const query = `
    SELECT
      disputes.id,
      disputes.order_id,
      disputes.buyer_id,
      buyers.name AS buyer_name,
      buyers.email AS buyer_email,
      disputes.vendor_id,
      vendors.name AS vendor_name,
      vendors.email AS vendor_email,
      disputes.reason,
      disputes.description,
      disputes.status,
      disputes.resolution,
      disputes.refund_amount,
      disputes.admin_note,
      disputes.created_at,
      disputes.updated_at
    FROM disputes
    JOIN users AS buyers
      ON disputes.buyer_id = buyers.id
    JOIN users AS vendors
      ON disputes.vendor_id = vendors.id
    ORDER BY disputes.created_at DESC
  `;

  db.query(
    query,
    (err, disputes) => {
      if (err) {
        console.error(
          "Get all disputes error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch disputes"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Disputes fetched successfully",
        disputes
      });
    }
  );
};


// ==========================================
// UPDATE DISPUTE - ADMIN
// ==========================================

const updateDispute = (req, res) => {
  const disputeId = Number(req.params.id);

  const {
    status,
    resolution,
    refund_amount,
    admin_note
  } = req.body;

  if (
    !Number.isInteger(disputeId) ||
    disputeId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid dispute ID"
    });
  }

  const allowedStatuses = [
    "open",
    "under_review",
    "resolved",
    "rejected",
    "closed"
  ];

  const allowedResolutions = [
    "refund",
    "replacement",
    "no_action",
    "partial_refund"
  ];

  if (
    typeof status !== "string" ||
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid dispute status"
    });
  }

  if (
    resolution !== undefined &&
    resolution !== null &&
    !allowedResolutions.includes(resolution)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid dispute resolution"
    });
  }

  const refundAmount =
    refund_amount === undefined ||
    refund_amount === null
      ? 0
      : Number(refund_amount);

  if (
    !Number.isFinite(refundAmount) ||
    refundAmount < 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Refund amount must be a valid non-negative number"
    });
  }

  if (
    admin_note !== undefined &&
    admin_note !== null &&
    typeof admin_note !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Admin note must be a string"
    });
  }

  const query = `
    UPDATE disputes
    SET
      status = ?,
      resolution = ?,
      refund_amount = ?,
      admin_note = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      status,
      resolution || null,
      refundAmount,
      admin_note || null,
      disputeId
    ],
    (err, result) => {
      if (err) {
        console.error(
          "Update dispute error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to update dispute"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Dispute not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Dispute updated successfully"
      });
    }
  );
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createDispute,
  getMyDisputes,
  getVendorDisputes,
  getAllDisputes,
  updateDispute
};
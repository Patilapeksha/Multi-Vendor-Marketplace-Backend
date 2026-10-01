const db = require("../../db");

const ALLOWED_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled"
];

// Get vendor's orders
const getVendorOrders = (req, res) => {
  const vendorId = req.user.id;

  const query = `
    SELECT
      vendor_orders.id,
      vendor_orders.order_id,
      vendor_orders.vendor_id,
      vendor_orders.subtotal,
      vendor_orders.status,
      vendor_orders.tracking_number,
      vendor_orders.created_at,
      vendor_orders.updated_at
    FROM vendor_orders
    WHERE vendor_orders.vendor_id = ?
    ORDER BY vendor_orders.created_at DESC
  `;

  db.query(query, [vendorId], (err, orders) => {
    if (err) {
      console.error("Get vendor orders error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch vendor orders"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor orders fetched successfully",
      orders
    });
  });
};

// Update vendor order status and tracking
const updateVendorOrderStatus = (req, res) => {
  const vendorOrderId = Number(req.params.id);

  const {
    status,
    tracking_number
  } = req.body;

  if (
    !Number.isInteger(vendorOrderId) ||
    vendorOrderId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid vendor order ID"
    });
  }

  if (
    !status ||
    typeof status !== "string" ||
    !ALLOWED_STATUSES.includes(
      status.toLowerCase()
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status. Allowed statuses: pending, processing, shipped, delivered, cancelled"
    });
  }

  const normalizedStatus =
    status.toLowerCase();

  if (
    tracking_number !== undefined &&
    tracking_number !== null &&
    (
      typeof tracking_number !== "string" ||
      tracking_number.trim().length === 0
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid tracking number"
    });
  }

  // Verify vendor ownership
  const ownershipQuery = `
    SELECT
      id,
      status,
      tracking_number
    FROM vendor_orders
    WHERE id = ?
      AND vendor_id = ?
  `;

  db.query(
    ownershipQuery,
    [
      vendorOrderId,
      req.user.id
    ],
    (err, orders) => {
      if (err) {
        console.error(
          "Vendor order ownership error:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to verify vendor order ownership"
        });
      }

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Vendor order not found or access denied"
        });
      }

      // Basic status transition validation
      const currentStatus =
        orders[0].status;

      const validTransitions = {
        pending: [
          "pending",
          "processing",
          "cancelled"
        ],

        processing: [
          "processing",
          "shipped",
          "cancelled"
        ],

        shipped: [
          "shipped",
          "delivered"
        ],

        delivered: [
          "delivered"
        ],

        cancelled: [
          "cancelled"
        ]
      };

      if (
        !validTransitions[currentStatus] ||
        !validTransitions[currentStatus].includes(
          normalizedStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid status transition from ${currentStatus} to ${normalizedStatus}`
        });
      }

      // Tracking number required when shipping
      if (
        normalizedStatus === "shipped" &&
        (
          !tracking_number ||
          tracking_number.trim().length === 0
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tracking number is required when order is shipped"
        });
      }

      const updateQuery = `
        UPDATE vendor_orders
        SET
          status = ?,
          tracking_number = COALESCE(?, tracking_number)
        WHERE id = ?
          AND vendor_id = ?
      `;

      db.query(
        updateQuery,
        [
          normalizedStatus,
          tracking_number
            ? tracking_number.trim()
            : null,
          vendorOrderId,
          req.user.id
        ],
        (updateErr, result) => {
          if (updateErr) {
            console.error(
              "Update vendor order error:",
              updateErr
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to update vendor order"
            });
          }

          return res.status(200).json({
            success: true,
            message:
              "Vendor order updated successfully",
            updated: result.affectedRows > 0
          });
        }
      );
    }
  );
};

module.exports = {
  getVendorOrders,
  updateVendorOrderStatus
};
const db = require("../../db");

// GET ALL RETURNS FOR LOGGED-IN VENDOR
const getVendorReturns = (req, res) => {
  const vendorId = req.user.id;

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
      console.error("Get vendor returns error:", err);

      return res.status(500).json({
        message: "Failed to fetch vendor returns"
      });
    }

    res.status(200).json({
      message: "Vendor returns fetched successfully",
      returns: rows
    });
  });
};


// GET SINGLE RETURN FOR LOGGED-IN VENDOR
const getVendorReturnById = (req, res) => {
  const vendorId = req.user.id;
  const returnId = Number(req.params.id);

  if (!Number.isInteger(returnId) || returnId <= 0) {
    return res.status(400).json({
      message: "Invalid return ID"
    });
  }

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
    WHERE r.id = ?
      AND r.vendor_id = ?
  `;

  db.query(
    query,
    [returnId, vendorId],
    (err, rows) => {
      if (err) {
        console.error("Get vendor return error:", err);

        return res.status(500).json({
          message: "Failed to fetch return"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Return not found"
        });
      }

      res.status(200).json({
        message: "Return fetched successfully",
        return: rows[0]
      });
    }
  );
};


// APPROVE RETURN - VENDOR
const approveVendorReturn = (req, res) => {
  const vendorId = req.user.id;
  const returnId = Number(req.params.id);

  const vendorNote =
    req.body.vendor_note &&
    typeof req.body.vendor_note === "string"
      ? req.body.vendor_note.trim()
      : null;

  if (!Number.isInteger(returnId) || returnId <= 0) {
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
      AND vendor_id = ?
  `;

  db.query(
    findQuery,
    [returnId, vendorId],
    (err, rows) => {
      if (err) {
        console.error("Find vendor return error:", err);

        return res.status(500).json({
          message: "Failed to find return"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Return not found"
        });
      }

      if (rows[0].status !== "requested") {
        return res.status(400).json({
          message: "Only requested returns can be approved"
        });
      }

      const updateQuery = `
        UPDATE returns
        SET
          status = 'approved',
          admin_note = COALESCE(?, admin_note)
        WHERE id = ?
          AND vendor_id = ?
      `;

      db.query(
        updateQuery,
        [vendorNote, returnId, vendorId],
        (err) => {
          if (err) {
            console.error("Approve vendor return error:", err);

            return res.status(500).json({
              message: "Failed to approve return"
            });
          }

          res.status(200).json({
            message: "Return approved successfully",
            return_id: returnId,
            status: "approved"
          });
        }
      );
    }
  );
};


// REJECT RETURN - VENDOR
const rejectVendorReturn = (req, res) => {
  const vendorId = req.user.id;
  const returnId = Number(req.params.id);

  const vendorNote =
    req.body.vendor_note &&
    typeof req.body.vendor_note === "string"
      ? req.body.vendor_note.trim()
      : null;

  if (!Number.isInteger(returnId) || returnId <= 0) {
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
      AND vendor_id = ?
  `;

  db.query(
    findQuery,
    [returnId, vendorId],
    (err, rows) => {
      if (err) {
        console.error("Find vendor return error:", err);

        return res.status(500).json({
          message: "Failed to find return"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Return not found"
        });
      }

      if (rows[0].status !== "requested") {
        return res.status(400).json({
          message: "Only requested returns can be rejected"
        });
      }

      const updateQuery = `
        UPDATE returns
        SET
          status = 'rejected',
          admin_note = COALESCE(?, admin_note)
        WHERE id = ?
          AND vendor_id = ?
      `;

      db.query(
        updateQuery,
        [vendorNote, returnId, vendorId],
        (err) => {
          if (err) {
            console.error("Reject vendor return error:", err);

            return res.status(500).json({
              message: "Failed to reject return"
            });
          }

          res.status(200).json({
            message: "Return rejected successfully",
            return_id: returnId,
            status: "rejected"
          });
        }
      );
    }
  );
};


module.exports = {
  getVendorReturns,
  getVendorReturnById,
  approveVendorReturn,
  rejectVendorReturn
};
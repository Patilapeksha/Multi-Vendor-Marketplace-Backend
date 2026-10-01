const db = require("../../db");

// GET ALL RETURNS - ADMIN
const getAllReturns = (req, res) => {
  const query = `
    SELECT
      r.id,
      r.order_id,
      r.buyer_id,
      buyer.email AS buyer_email,
      r.vendor_id,
      vendor.email AS vendor_email,
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
    JOIN users vendor
      ON r.vendor_id = vendor.id
    ORDER BY r.created_at DESC
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error("Get all returns error:", err);

      return res.status(500).json({
        message: "Failed to fetch returns"
      });
    }

    res.status(200).json({
      message: "Returns fetched successfully",
      returns: rows
    });
  });
};


// GET SINGLE RETURN - ADMIN
const getReturnByIdAdmin = (req, res) => {
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
      vendor.email AS vendor_email,
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
    JOIN users vendor
      ON r.vendor_id = vendor.id
    WHERE r.id = ?
  `;

  db.query(query, [returnId], (err, rows) => {
    if (err) {
      console.error("Get return error:", err);

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
  });
};


// APPROVE RETURN - ADMIN
const approveReturn = (req, res) => {
  const returnId = Number(req.params.id);
  const adminNote =
    req.body.admin_note && typeof req.body.admin_note === "string"
      ? req.body.admin_note.trim()
      : null;

  if (!Number.isInteger(returnId) || returnId <= 0) {
    return res.status(400).json({
      message: "Invalid return ID"
    });
  }

  const findQuery = `
    SELECT id, status
    FROM returns
    WHERE id = ?
  `;

  db.query(findQuery, [returnId], (err, rows) => {
    if (err) {
      console.error("Find return error:", err);

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
        admin_note = ?
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [adminNote, returnId],
      (err) => {
        if (err) {
          console.error("Approve return error:", err);

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
  });
};


// REJECT RETURN - ADMIN
const rejectReturn = (req, res) => {
  const returnId = Number(req.params.id);
  const adminNote =
    req.body.admin_note && typeof req.body.admin_note === "string"
      ? req.body.admin_note.trim()
      : null;

  if (!Number.isInteger(returnId) || returnId <= 0) {
    return res.status(400).json({
      message: "Invalid return ID"
    });
  }

  const findQuery = `
    SELECT id, status
    FROM returns
    WHERE id = ?
  `;

  db.query(findQuery, [returnId], (err, rows) => {
    if (err) {
      console.error("Find return error:", err);

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
        admin_note = ?
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [adminNote, returnId],
      (err) => {
        if (err) {
          console.error("Reject return error:", err);

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
  });
};


// PROCESS REFUND - ADMIN
const processRefund = (req, res) => {
  const returnId = Number(req.params.id);

  if (!Number.isInteger(returnId) || returnId <= 0) {
    return res.status(400).json({
      message: "Invalid return ID"
    });
  }

  const findQuery = `
    SELECT
      id,
      status,
      refund_amount
    FROM returns
    WHERE id = ?
  `;

  db.query(findQuery, [returnId], (err, rows) => {
    if (err) {
      console.error("Find refund return error:", err);

      return res.status(500).json({
        message: "Failed to find return"
      });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Return not found"
      });
    }

    if (rows[0].status !== "approved") {
      return res.status(400).json({
        message: "Only approved returns can be refunded"
      });
    }

    const updateQuery = `
      UPDATE returns
      SET status = 'refunded'
      WHERE id = ?
    `;

    db.query(updateQuery, [returnId], (err) => {
      if (err) {
        console.error("Process refund error:", err);

        return res.status(500).json({
          message: "Failed to process refund"
        });
      }

      res.status(200).json({
        message: "Refund processed successfully",
        return_id: returnId,
        refund_amount: rows[0].refund_amount,
        status: "refunded"
      });
    });
  });
};


module.exports = {
  getAllReturns,
  getReturnByIdAdmin,
  approveReturn,
  rejectReturn,
  processRefund
};
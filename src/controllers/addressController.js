const db = require("../../db");

// ==========================================
// ADD ADDRESS
// ==========================================

const addAddress = (req, res) => {
  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    is_default
  } = req.body;

  if (
    !full_name ||
    !phone ||
    !address_line1 ||
    !city ||
    !state ||
    !postal_code
  ) {
    return res.status(400).json({
      success: false,
      message: "Required address fields are missing"
    });
  }

  const defaultValue =
    Boolean(is_default);

  const insertAddress = () => {
    const query = `
      INSERT INTO addresses
      (
        user_id,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        req.user.id,
        full_name.trim(),
        phone.trim(),
        address_line1.trim(),
        address_line2
          ? address_line2.trim()
          : null,
        city.trim(),
        state.trim(),
        postal_code.trim(),
        country
          ? country.trim()
          : "India",
        defaultValue
      ],
      (err, result) => {
        if (err) {
          console.error(
            "Add address error:",
            err
          );

          return res.status(500).json({
            success: false,
            message: "Failed to add address"
          });
        }

        return res.status(201).json({
          success: true,
          message: "Address added successfully",
          address_id: result.insertId
        });
      }
    );
  };

  // If setting as default,
  // remove default from existing addresses
  if (defaultValue) {
    db.query(
      `
      UPDATE addresses
      SET is_default = FALSE
      WHERE user_id = ?
      `,
      [req.user.id],
      (err) => {
        if (err) {
          console.error(
            "Default address reset error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to update default address"
          });
        }

        insertAddress();
      }
    );
  } else {
    insertAddress();
  }
};


// ==========================================
// GET MY ADDRESSES
// ==========================================

const getMyAddresses = (req, res) => {
  const query = `
    SELECT
      id,
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default,
      created_at,
      updated_at
    FROM addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, created_at DESC
  `;

  db.query(
    query,
    [req.user.id],
    (err, addresses) => {
      if (err) {
        console.error(
          "Get addresses error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch addresses"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Addresses fetched successfully",
        addresses
      });
    }
  );
};


// ==========================================
// UPDATE ADDRESS
// ==========================================

const updateAddress = (req, res) => {
  const addressId = Number(req.params.id);

  if (
    !Number.isInteger(addressId) ||
    addressId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid address ID"
    });
  }

  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    is_default
  } = req.body;

  if (
    !full_name ||
    !phone ||
    !address_line1 ||
    !city ||
    !state ||
    !postal_code
  ) {
    return res.status(400).json({
      success: false,
      message: "Required address fields are missing"
    });
  }

  const defaultValue =
    Boolean(is_default);

  const updateAddressData = () => {
    const query = `
      UPDATE addresses
      SET
        full_name = ?,
        phone = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        state = ?,
        postal_code = ?,
        country = ?,
        is_default = ?
      WHERE id = ?
        AND user_id = ?
    `;

    db.query(
      query,
      [
        full_name.trim(),
        phone.trim(),
        address_line1.trim(),
        address_line2
          ? address_line2.trim()
          : null,
        city.trim(),
        state.trim(),
        postal_code.trim(),
        country
          ? country.trim()
          : "India",
        defaultValue,
        addressId,
        req.user.id
      ],
      (err, result) => {
        if (err) {
          console.error(
            "Update address error:",
            err
          );

          return res.status(500).json({
            success: false,
            message: "Failed to update address"
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message:
              "Address not found or access denied"
          });
        }

        return res.status(200).json({
          success: true,
          message:
            "Address updated successfully"
        });
      }
    );
  };

  if (defaultValue) {
    db.query(
      `
      UPDATE addresses
      SET is_default = FALSE
      WHERE user_id = ?
      `,
      [req.user.id],
      (err) => {
        if (err) {
          console.error(
            "Default reset error:",
            err
          );

          return res.status(500).json({
            success: false,
            message:
              "Failed to update default address"
          });
        }

        updateAddressData();
      }
    );
  } else {
    updateAddressData();
  }
};


// ==========================================
// DELETE ADDRESS
// ==========================================

const deleteAddress = (req, res) => {
  const addressId = Number(req.params.id);

  if (
    !Number.isInteger(addressId) ||
    addressId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid address ID"
    });
  }

  const query = `
    DELETE FROM addresses
    WHERE id = ?
      AND user_id = ?
  `;

  db.query(
    query,
    [addressId, req.user.id],
    (err, result) => {
      if (err) {
        console.error(
          "Delete address error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to delete address"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Address not found or access denied"
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Address deleted successfully"
      });
    }
  );
};


module.exports = {
  addAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress
};
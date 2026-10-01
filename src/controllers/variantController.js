const db = require("../../db");

// ==========================================
// CREATE VARIANT
// ==========================================

const createVariant = (req, res) => {
  const productId = Number(req.params.productId);

  const {
    variant_name,
    variant_value,
    price,
    stock_quantity
  } = req.body;

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  if (
    typeof variant_name !== "string" ||
    variant_name.trim().length === 0 ||
    variant_name.trim().length > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Variant name is required"
    });
  }

  if (
    typeof variant_value !== "string" ||
    variant_value.trim().length === 0 ||
    variant_value.trim().length > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Variant value is required"
    });
  }

  const variantPrice =
    price === undefined || price === null
      ? null
      : Number(price);

  const variantStock =
    stock_quantity === undefined ||
    stock_quantity === null
      ? 0
      : Number(stock_quantity);

  if (
    variantPrice !== null &&
    (!Number.isFinite(variantPrice) ||
      variantPrice < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid non-negative number"
    });
  }

  if (
    !Number.isInteger(variantStock) ||
    variantStock < 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Stock quantity must be a non-negative integer"
    });
  }

  // Verify product belongs to logged-in vendor
  const productQuery = `
    SELECT id
    FROM products
    WHERE id = ?
      AND vendor_id = ?
  `;

  db.query(
    productQuery,
    [productId, req.user.id],
    (productErr, products) => {
      if (productErr) {
        console.error(
          "Verify product error:",
          productErr
        );

        return res.status(500).json({
          success: false,
          message: "Failed to verify product"
        });
      }

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found or does not belong to vendor"
        });
      }

      const insertQuery = `
        INSERT INTO product_variants
        (
          product_id,
          variant_name,
          variant_value,
          price,
          stock_quantity
        )
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          productId,
          variant_name.trim(),
          variant_value.trim(),
          variantPrice,
          variantStock
        ],
        (insertErr, result) => {
          if (insertErr) {
            if (
              insertErr.code ===
              "ER_DUP_ENTRY"
            ) {
              return res.status(409).json({
                success: false,
                message:
                  "This product variant already exists"
              });
            }

            console.error(
              "Create variant error:",
              insertErr
            );

            return res.status(500).json({
              success: false,
              message: "Failed to create variant"
            });
          }

          return res.status(201).json({
            success: true,
            message:
              "Product variant created successfully",
            variant_id: result.insertId
          });
        }
      );
    }
  );
};


// ==========================================
// GET PRODUCT VARIANTS
// ==========================================

const getProductVariants = (req, res) => {
  const productId = Number(req.params.productId);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  const query = `
    SELECT
      id,
      product_id,
      variant_name,
      variant_value,
      price,
      stock_quantity,
      created_at,
      updated_at
    FROM product_variants
    WHERE product_id = ?
    ORDER BY id ASC
  `;

  db.query(
    query,
    [productId],
    (err, variants) => {
      if (err) {
        console.error(
          "Get variants error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch product variants"
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Product variants fetched successfully",
        variants
      });
    }
  );
};


// ==========================================
// UPDATE VARIANT
// ==========================================

const updateVariant = (req, res) => {
  const variantId = Number(req.params.id);

  const {
    variant_name,
    variant_value,
    price,
    stock_quantity
  } = req.body;

  if (
    !Number.isInteger(variantId) ||
    variantId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid variant ID"
    });
  }

  if (
    typeof variant_name !== "string" ||
    variant_name.trim().length === 0 ||
    variant_name.trim().length > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Variant name is required"
    });
  }

  if (
    typeof variant_value !== "string" ||
    variant_value.trim().length === 0 ||
    variant_value.trim().length > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Variant value is required"
    });
  }

  const variantPrice = Number(price);
  const variantStock = Number(stock_quantity);

  if (
    !Number.isFinite(variantPrice) ||
    variantPrice < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid non-negative number"
    });
  }

  if (
    !Number.isInteger(variantStock) ||
    variantStock < 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Stock quantity must be a non-negative integer"
    });
  }

  const verifyQuery = `
    SELECT
      product_variants.id
    FROM product_variants
    JOIN products
      ON product_variants.product_id = products.id
    WHERE product_variants.id = ?
      AND products.vendor_id = ?
  `;

  db.query(
    verifyQuery,
    [variantId, req.user.id],
    (verifyErr, rows) => {
      if (verifyErr) {
        console.error(
          "Verify variant error:",
          verifyErr
        );

        return res.status(500).json({
          success: false,
          message: "Failed to verify variant"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Variant not found or does not belong to vendor"
        });
      }

      const updateQuery = `
        UPDATE product_variants
        SET
          variant_name = ?,
          variant_value = ?,
          price = ?,
          stock_quantity = ?
        WHERE id = ?
      `;

      db.query(
        updateQuery,
        [
          variant_name.trim(),
          variant_value.trim(),
          variantPrice,
          variantStock,
          variantId
        ],
        (updateErr) => {
          if (updateErr) {
            if (
              updateErr.code ===
              "ER_DUP_ENTRY"
            ) {
              return res.status(409).json({
                success: false,
                message:
                  "This product variant already exists"
              });
            }

            console.error(
              "Update variant error:",
              updateErr
            );

            return res.status(500).json({
              success: false,
              message: "Failed to update variant"
            });
          }

          return res.status(200).json({
            success: true,
            message:
              "Product variant updated successfully"
          });
        }
      );
    }
  );
};


// ==========================================
// DELETE VARIANT
// ==========================================

const deleteVariant = (req, res) => {
  const variantId = Number(req.params.id);

  if (
    !Number.isInteger(variantId) ||
    variantId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid variant ID"
    });
  }

  const verifyQuery = `
    SELECT
      product_variants.id
    FROM product_variants
    JOIN products
      ON product_variants.product_id = products.id
    WHERE product_variants.id = ?
      AND products.vendor_id = ?
  `;

  db.query(
    verifyQuery,
    [variantId, req.user.id],
    (verifyErr, rows) => {
      if (verifyErr) {
        console.error(
          "Verify variant error:",
          verifyErr
        );

        return res.status(500).json({
          success: false,
          message: "Failed to verify variant"
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Variant not found or does not belong to vendor"
        });
      }

      const deleteQuery = `
        DELETE FROM product_variants
        WHERE id = ?
      `;

      db.query(
        deleteQuery,
        [variantId],
        (deleteErr, result) => {
          if (deleteErr) {
            console.error(
              "Delete variant error:",
              deleteErr
            );

            return res.status(500).json({
              success: false,
              message: "Failed to delete variant"
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Variant not found"
            });
          }

          return res.status(200).json({
            success: true,
            message:
              "Product variant deleted successfully"
          });
        }
      );
    }
  );
};


module.exports = {
  createVariant,
  getProductVariants,
  updateVariant,
  deleteVariant
};
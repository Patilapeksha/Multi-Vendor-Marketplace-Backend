const db = require("../../db");

// Add product image
const addProductImage = (req, res) => {
  const productId = Number(req.params.productId);
  const { image_url, is_primary = false } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  if (
    !image_url ||
    typeof image_url !== "string" ||
    image_url.trim().length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Image URL is required"
    });
  }

  // Check product ownership
  const productQuery = `
    SELECT id
    FROM products
    WHERE id = ?
      AND vendor_id = ?
  `;

  db.query(
    productQuery,
    [productId, req.user.id],
    (err, products) => {
      if (err) {
        console.error("Product ownership error:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to verify product ownership"
        });
      }

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found or access denied"
        });
      }

      // If this image is primary, remove primary
      // status from existing images first.
      const insertImage = () => {
        const insertQuery = `
          INSERT INTO product_images
          (
            product_id,
            image_url,
            is_primary
          )
          VALUES (?, ?, ?)
        `;

        db.query(
          insertQuery,
          [
            productId,
            image_url.trim(),
            Boolean(is_primary)
          ],
          (insertErr, result) => {
            if (insertErr) {
              console.error(
                "Add product image error:",
                insertErr
              );

              return res.status(500).json({
                success: false,
                message: "Failed to add product image"
              });
            }

            return res.status(201).json({
              success: true,
              message: "Product image added successfully",
              image_id: result.insertId
            });
          }
        );
      };

      if (Boolean(is_primary)) {
        const resetQuery = `
          UPDATE product_images
          SET is_primary = FALSE
          WHERE product_id = ?
        `;

        db.query(
          resetQuery,
          [productId],
          (resetErr) => {
            if (resetErr) {
              console.error(
                "Reset primary image error:",
                resetErr
              );

              return res.status(500).json({
                success: false,
                message: "Failed to update primary image"
              });
            }

            insertImage();
          }
        );
      } else {
        insertImage();
      }
    }
  );
};

// Get product images
const getProductImages = (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  const query = `
    SELECT
      id,
      product_id,
      image_url,
      is_primary,
      created_at
    FROM product_images
    WHERE product_id = ?
    ORDER BY is_primary DESC, id ASC
  `;

  db.query(query, [productId], (err, images) => {
    if (err) {
      console.error(
        "Get product images error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch product images"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product images fetched successfully",
      images
    });
  });
};

// Update product image
const updateProductImage = (req, res) => {
  const imageId = Number(req.params.id);
  const { image_url, is_primary } = req.body;

  if (!Number.isInteger(imageId) || imageId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid image ID"
    });
  }

  if (
    image_url !== undefined &&
    (
      typeof image_url !== "string" ||
      image_url.trim().length === 0
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid image URL"
    });
  }

  const ownershipQuery = `
    SELECT product_images.id
    FROM product_images
    JOIN products
      ON product_images.product_id = products.id
    WHERE product_images.id = ?
      AND products.vendor_id = ?
  `;

  db.query(
    ownershipQuery,
    [imageId, req.user.id],
    (err, images) => {
      if (err) {
        console.error(
          "Image ownership error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to verify image ownership"
        });
      }

      if (images.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Image not found or access denied"
        });
      }

      const updateImage = () => {
        const fields = [];
        const values = [];

        if (image_url !== undefined) {
          fields.push("image_url = ?");
          values.push(image_url.trim());
        }

        if (is_primary !== undefined) {
          fields.push("is_primary = ?");
          values.push(Boolean(is_primary));
        }

        if (fields.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No fields provided for update"
          });
        }

        values.push(imageId);

        const updateQuery = `
          UPDATE product_images
          SET ${fields.join(", ")}
          WHERE id = ?
        `;

        db.query(
          updateQuery,
          values,
          (updateErr) => {
            if (updateErr) {
              console.error(
                "Update product image error:",
                updateErr
              );

              return res.status(500).json({
                success: false,
                message: "Failed to update product image"
              });
            }

            return res.status(200).json({
              success: true,
              message: "Product image updated successfully"
            });
          }
        );
      };

      if (Boolean(is_primary)) {
        const productQuery = `
          SELECT product_id
          FROM product_images
          WHERE id = ?
        `;

        db.query(
          productQuery,
          [imageId],
          (productErr, rows) => {
            if (productErr || rows.length === 0) {
              return res.status(500).json({
                success: false,
                message: "Failed to find product"
              });
            }

            const resetQuery = `
              UPDATE product_images
              SET is_primary = FALSE
              WHERE product_id = ?
            `;

            db.query(
              resetQuery,
              [rows[0].product_id],
              (resetErr) => {
                if (resetErr) {
                  return res.status(500).json({
                    success: false,
                    message: "Failed to update primary image"
                  });
                }

                updateImage();
              }
            );
          }
        );
      } else {
        updateImage();
      }
    }
  );
};

// Delete product image
const deleteProductImage = (req, res) => {
  const imageId = Number(req.params.id);

  if (!Number.isInteger(imageId) || imageId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid image ID"
    });
  }

  const query = `
    DELETE product_images
    FROM product_images
    JOIN products
      ON product_images.product_id = products.id
    WHERE product_images.id = ?
      AND products.vendor_id = ?
  `;

  db.query(
    query,
    [imageId, req.user.id],
    (err, result) => {
      if (err) {
        console.error(
          "Delete product image error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to delete product image"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Image not found or access denied"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product image deleted successfully"
      });
    }
  );
};

module.exports = {
  addProductImage,
  getProductImages,
  updateProductImage,
  deleteProductImage
};
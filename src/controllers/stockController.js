const db = require("../../db");

// GET PRODUCT STOCK
const getProductStock = (req, res) => {
  const productId = req.params.productId;
  const vendorId = req.user.id;

  const query = `
    SELECT
      products.id,
      products.title,
      inventory.stock_quantity AS stock
    FROM products
    JOIN inventory
      ON products.id = inventory.product_id
    WHERE products.id = ?
      AND products.vendor_id = ?
  `;

  db.query(query, [productId, vendorId], (err, products) => {
    if (err) {
      console.error("Get stock error:", err);

      return res.status(500).json({
        message: "Failed to fetch stock"
      });
    }

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found or you do not own this product"
      });
    }

    res.status(200).json({
      message: "Stock retrieved successfully",
      product: products[0]
    });
  });
};


// UPDATE PRODUCT STOCK
const updateProductStock = (req, res) => {
  const productId = req.params.productId;
  const vendorId = req.user.id;
  const { stock } = req.body;

  if (stock === undefined || stock === null) {
    return res.status(400).json({
      message: "Stock is required"
    });
  }

  const stockQuantity = Number(stock);

  if (!Number.isInteger(stockQuantity)) {
    return res.status(400).json({
      message: "Stock must be a whole number"
    });
  }

  if (stockQuantity < 0) {
    return res.status(400).json({
      message: "Stock cannot be negative"
    });
  }

  // First verify that the vendor owns the product
  const checkProductQuery = `
    SELECT id
    FROM products
    WHERE id = ?
      AND vendor_id = ?
  `;

  db.query(
    checkProductQuery,
    [productId, vendorId],
    (err, products) => {
      if (err) {
        console.error("Check product error:", err);

        return res.status(500).json({
          message: "Failed to verify product"
        });
      }

      if (products.length === 0) {
        return res.status(404).json({
          message: "Product not found or you do not own this product"
        });
      }

      // Update inventory stock
      const updateQuery = `
        UPDATE inventory
        SET stock_quantity = ?
        WHERE product_id = ?
      `;

      db.query(
        updateQuery,
        [stockQuantity, productId],
        (err, result) => {
          if (err) {
            console.error("Update stock error:", err);

            return res.status(500).json({
              message: "Failed to update stock"
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              message: "Inventory record not found"
            });
          }

          res.status(200).json({
            message: "Stock updated successfully",
            productId: Number(productId),
            stock: stockQuantity
          });
        }
      );
    }
  );
};


module.exports = {
  getProductStock,
  updateProductStock
};
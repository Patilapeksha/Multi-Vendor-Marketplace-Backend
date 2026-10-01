const db = require("../../db");

// Get all products for Admin
const getAllProducts = (req, res) => {
  const query = `
    SELECT
      products.id,
      products.title,
      products.description,
      products.price,
      products.status,
      products.vendor_id,
      users.name AS vendor_name,
      users.email AS vendor_email,
      categories.name AS category_name,
      inventory.stock_quantity,
      inventory.low_stock_threshold,
      products.created_at
    FROM products

    LEFT JOIN users
      ON products.vendor_id = users.id

    LEFT JOIN categories
      ON products.category_id = categories.id

    LEFT JOIN inventory
      ON products.id = inventory.product_id

    ORDER BY products.created_at DESC
  `;

  db.query(query, (err, products) => {
    if (err) {
      console.error(
        "Admin get products error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch products"
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products
    });
  });
};


// Get single product for Admin
const getProductById = (req, res) => {
  const productId = Number(req.params.id);

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
      products.id,
      products.title,
      products.description,
      products.price,
      products.status,
      products.vendor_id,
      users.name AS vendor_name,
      users.email AS vendor_email,
      categories.name AS category_name,
      inventory.stock_quantity,
      inventory.low_stock_threshold,
      products.created_at
    FROM products

    LEFT JOIN users
      ON products.vendor_id = users.id

    LEFT JOIN categories
      ON products.category_id = categories.id

    LEFT JOIN inventory
      ON products.id = inventory.product_id

    WHERE products.id = ?
  `;

  db.query(
    query,
    [productId],
    (err, products) => {
      if (err) {
        console.error(
          "Admin get product error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch product"
        });
      }

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        product: products[0]
      });
    }
  );
};


// Update product status
const updateProductStatus = (req, res) => {
  const productId = Number(req.params.id);
  const { status } = req.body;

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  const allowedStatuses = [
    "active",
    "inactive",
    "removed"
  ];

  if (
    typeof status !== "string" ||
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Status must be active, inactive, or removed"
    });
  }

  const query = `
    UPDATE products
    SET status = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [status, productId],
    (err, result) => {
      if (err) {
        console.error(
          "Admin update product status error:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to update product status"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Product status updated successfully"
      });
    }
  );
};


module.exports = {
  getAllProducts,
  getProductById,
  updateProductStatus
};
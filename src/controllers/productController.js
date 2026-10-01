const db = require("../../db");

// Get all products
const getProducts = (req, res) => {
  const {
    search,
    category_id,
    min_price,
    max_price,
    vendor_id
  } = req.query;

  let query = `
    SELECT
      products.id,
      products.vendor_id,
      products.category_id,
      products.title,
      products.description,
      products.price,
      products.image,
      inventory.stock_quantity,
      categories.name AS category_name
    FROM products
    LEFT JOIN inventory
      ON products.id = inventory.product_id
    LEFT JOIN categories
      ON products.category_id = categories.id
    WHERE 1 = 1
  `;

  const values = [];

  if (search) {
    query += `
      AND (
        products.title LIKE ?
        OR products.description LIKE ?
      )
    `;

    values.push(
      `%${search}%`,
      `%${search}%`
    );
  }

  if (category_id) {
    query += `
      AND products.category_id = ?
    `;

    values.push(category_id);
  }

  if (min_price) {
    query += `
      AND products.price >= ?
    `;

    values.push(min_price);
  }

  if (max_price) {
    query += `
      AND products.price <= ?
    `;

    values.push(max_price);
  }

  if (vendor_id) {
    query += `
      AND products.vendor_id = ?
    `;

    values.push(vendor_id);
  }

  query += `
    ORDER BY products.created_at DESC
  `;

  db.query(query, values, (err, products) => {
    if (err) {
      console.error("Get products error:", err);

      return res.status(500).json({
        message: "Failed to fetch products"
      });
    }

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products
    });
  });
};


// Get single product
const getProductById = (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "Invalid product ID"
    });
  }

  const query = `
    SELECT
      products.id,
      products.vendor_id,
      products.category_id,
      products.title,
      products.description,
      products.price,
      products.image,
      products.status,
      products.created_at,
      products.updated_at,
      inventory.stock_quantity,
      categories.name AS category_name
    FROM products
    LEFT JOIN inventory
      ON products.id = inventory.product_id
    LEFT JOIN categories
      ON products.category_id = categories.id
    WHERE products.id = ?
  `;

  db.query(query, [productId], (err, products) => {
    if (err) {
      console.error("Get product error:", err);

      return res.status(500).json({
        message: "Failed to fetch product"
      });
    }

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product: products[0]
    });
  });
};

// Create product
const createProduct = (req, res) => {
  const vendorId = req.user.id;

  const {
    category_id,
    title,
    description,
    price,
  } = req.body;

 const image = req.file
  ? `/uploads/${req.file.filename}`
  : null;

  // Validation
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Product title is required"
    });
  }

  if (title.trim().length > 255) {
    return res.status(400).json({
      message: "Product title must not exceed 255 characters"
    });
  }

  if (
    price === undefined ||
    price === null ||
    price === "" ||
    isNaN(price) ||
    Number(price) <= 0
  ) {
    return res.status(400).json({
      message: "Price must be a valid number greater than 0"
    });
  }

  if (
    category_id !== undefined &&
    category_id !== null &&
    category_id !== "" &&
    (!Number.isInteger(Number(category_id)) ||
      Number(category_id) <= 0)
  ) {
    return res.status(400).json({
      message: "Category ID must be a valid positive integer"
    });
  }

 

  const query = `
    INSERT INTO products
    (
      vendor_id,
      category_id,
      title,
      description,
      price,
      image,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `;

  db.query(
    query,
    [
      vendorId,
      category_id || null,
      title.trim(),
      description || null,
      Number(price),
      image || null
    ],
    (err, result) => {
      if (err) {
        console.error("Create product error:", err);

        return res.status(500).json({
          message: "Failed to create product"
        });
      }

      res.status(201).json({
        message: "Product created successfully",
        product_id: result.insertId
      });
    }
  );
};


// Update product
const updateProduct = (req, res) => {
  const productId = Number(req.params.id);
  const vendorId = req.user.id;

  const {
    category_id,
    title,
    description,
    price,
    status
  } = req.body;

  const image = req.file
  ? '/uploads/${req.file.filename}'
  :null;

  // Validation
  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "Invalid product ID"
    });
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Product title is required"
    });
  }

  if (title.trim().length > 255) {
    return res.status(400).json({
      message: "Product title must not exceed 255 characters"
    });
  }

  if (
    price === undefined ||
    price === null ||
    price === "" ||
    isNaN(price) ||
    Number(price) <= 0
  ) {
    return res.status(400).json({
      message: "Price must be a valid number greater than 0"
    });
  }

  if (
    category_id !== undefined &&
    category_id !== null &&
    category_id !== "" &&
    (!Number.isInteger(Number(category_id)) ||
      Number(category_id) <= 0)
  ) {
    return res.status(400).json({
      message: "Category ID must be a valid positive integer"
    });
  }

  const allowedStatuses = [
    "active",
    "inactive",
    "removed"
  ];

  if (
    status !== undefined &&
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      message:
        "Status must be active, inactive, or removed"
    });
  }

  const query = `
    UPDATE products
    SET
      category_id = ?,
      title = ?,
      description = ?,
      price = ?,
      image = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND vendor_id = ?
  `;

  db.query(
    query,
    [
      category_id || null,
      title.trim(),
      description || null,
      Number(price),
      image || null,
      status || "active",
      productId,
      vendorId
    ],
    (err, result) => {
      if (err) {
        console.error("Update product error:", err);

        return res.status(500).json({
          message: "Failed to update product"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message:
            "Product not found or you do not own this product"
        });
      }

      res.status(200).json({
        message: "Product updated successfully"
      });
    }
  );
};


// Delete product
const deleteProduct = (req, res) => {
  const productId = Number(req.params.id);
  const vendorId = req.user.id;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "Invalid product ID"
    });
  }

  const query = `
    UPDATE products
    SET
      status = 'removed',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND vendor_id = ?
  `;

  db.query(
    query,
    [productId, vendorId],
    (err, result) => {
      if (err) {
        console.error("Delete product error:", err);

        return res.status(500).json({
          message: "Failed to remove product"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message:
            "Product not found or you do not own this product"
        });
      }

      res.status(200).json({
        message: "Product removed successfully"
      });
    }
  );
};


// Get logged-in vendor's products
const getMyProducts = (req, res) => {
  const vendorId = req.user.id;

  const query = `
    SELECT
      id,
      vendor_id,
      category_id,
      title,
      description,
      price,
      image,
      status,
      created_at,
      updated_at
    FROM products
    WHERE vendor_id = ?
    AND status != 'removed'
    ORDER BY created_at DESC
  `;

  db.query(query, [vendorId], (err, products) => {
    if (err) {
      console.error("Get vendor products error:", err);

      return res.status(500).json({
        message: "Failed to fetch vendor products"
      });
    }

    res.status(200).json({
      message: "Vendor products fetched successfully",
      products
    });
  });
};


// Export functions
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
};
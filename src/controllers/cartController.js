const db = require("../../db");

// ADD PRODUCT TO CART
const addToCart = (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  // Validation
  const productId = Number(product_id);
  const requestedQuantity = Number(quantity);

  if (
    !Number.isInteger(productId) ||
    productId <= 0 ||
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity <= 0
  ) {
    return res.status(400).json({
      message:
        "Valid product_id and positive integer quantity are required"
    });
  }

  // Get current stock AND existing cart quantity
  const query = `
    SELECT
      inventory.stock_quantity,
      COALESCE(cart_items.quantity, 0) AS cart_quantity
    FROM inventory
    LEFT JOIN cart_items
      ON inventory.product_id = cart_items.product_id
      AND cart_items.user_id = ?
    WHERE inventory.product_id = ?
  `;

  db.query(
    query,
    [userId, productId],
    (err, results) => {
      if (err) {
        console.error(
          "Add to cart stock check error:",
          err
        );

        return res.status(500).json({
          message: "Failed to check product stock"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Product inventory not found"
        });
      }

      const stock =
        Number(results[0].stock_quantity);

      const existingQuantity =
        Number(results[0].cart_quantity);

      const finalQuantity =
        existingQuantity + requestedQuantity;

      // Important stock protection
      if (finalQuantity > stock) {
        return res.status(400).json({
          message: "Insufficient stock",
          available_stock: stock,
          current_cart_quantity: existingQuantity,
          requested_quantity: requestedQuantity
        });
      }

      const insertQuery = `
        INSERT INTO cart_items
        (
          user_id,
          product_id,
          quantity
        )
        VALUES (?, ?, ?)

        ON DUPLICATE KEY UPDATE
          quantity = quantity + VALUES(quantity)
      `;

      db.query(
        insertQuery,
        [
          userId,
          productId,
          requestedQuantity
        ],
        (err, result) => {
          if (err) {
            console.error(
              "Add to cart error:",
              err
            );

            return res.status(500).json({
              message:
                "Failed to add product to cart"
            });
          }

          res.status(201).json({
            message:
              "Product added to cart successfully"
          });
        }
      );
    }
  );
};


// GET CART
const getCart = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT
      cart_items.id,
      cart_items.product_id,
      products.title,
      products.price,
      products.image,
      cart_items.quantity,
      inventory.stock_quantity,
      (products.price * cart_items.quantity) AS total
    FROM cart_items
    JOIN products
      ON cart_items.product_id = products.id
    JOIN inventory
      ON products.id = inventory.product_id
    WHERE cart_items.user_id = ?
    ORDER BY cart_items.id DESC
  `;

  db.query(
    query,
    [userId],
    (err, results) => {
      if (err) {
        console.error(
          "Get cart error:",
          err
        );

        return res.status(500).json({
          message: "Failed to fetch cart"
        });
      }

      res.status(200).json({
        message: "Cart fetched successfully",
        cart: results
      });
    }
  );
};


// UPDATE CART QUANTITY
const updateCart = (req, res) => {
  const userId = req.user.id;
  const cartId = Number(req.params.id);
  const requestedQuantity = Number(
    req.body.quantity
  );

  // Validation
  if (
    !Number.isInteger(cartId) ||
    cartId <= 0
  ) {
    return res.status(400).json({
      message: "Invalid cart item ID"
    });
  }

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity <= 0
  ) {
    return res.status(400).json({
      message:
        "Quantity must be a positive integer"
    });
  }

  // Check cart ownership + stock
  const checkQuery = `
    SELECT
      cart_items.id,
      inventory.stock_quantity
    FROM cart_items
    JOIN inventory
      ON cart_items.product_id =
         inventory.product_id
    WHERE cart_items.id = ?
      AND cart_items.user_id = ?
  `;

  db.query(
    checkQuery,
    [cartId, userId],
    (err, results) => {
      if (err) {
        console.error(
          "Update cart check error:",
          err
        );

        return res.status(500).json({
          message: "Failed to check cart item"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Cart item not found"
        });
      }

      const stock =
        Number(results[0].stock_quantity);

      if (requestedQuantity > stock) {
        return res.status(400).json({
          message: "Insufficient stock",
          available_stock: stock
        });
      }

      const updateQuery = `
        UPDATE cart_items
        SET quantity = ?
        WHERE id = ?
          AND user_id = ?
      `;

      db.query(
        updateQuery,
        [
          requestedQuantity,
          cartId,
          userId
        ],
        (err, result) => {
          if (err) {
            console.error(
              "Update cart error:",
              err
            );

            return res.status(500).json({
              message:
                "Failed to update cart"
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              message:
                "Cart item not found"
            });
          }

          res.status(200).json({
            message:
              "Cart updated successfully"
          });
        }
      );
    }
  );
};


// REMOVE PRODUCT FROM CART
const removeFromCart = (req, res) => {
  const userId = req.user.id;
  const cartId = Number(req.params.id);

  if (
    !Number.isInteger(cartId) ||
    cartId <= 0
  ) {
    return res.status(400).json({
      message: "Invalid cart item ID"
    });
  }

  const query = `
    DELETE FROM cart_items
    WHERE id = ?
      AND user_id = ?
  `;

  db.query(
    query,
    [cartId, userId],
    (err, result) => {
      if (err) {
        console.error(
          "Remove cart error:",
          err
        );

        return res.status(500).json({
          message:
            "Failed to remove cart item"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Cart item not found"
        });
      }

      res.status(200).json({
        message:
          "Cart item removed successfully"
      });
    }
  );
};


module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart
};
const db = require("../../db");

// ==========================================
// CREATE REVIEW - BUYER ONLY
// ==========================================

const createReview = (req, res) => {
  const productId = Number(req.body.product_id);
  const rating = Number(req.body.rating);
  const comment = req.body.comment || null;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID"
    });
  }

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5"
    });
  }

  if (
    comment !== null &&
    typeof comment !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment"
    });
  }

  // Check product exists
  const productQuery = `
    SELECT id
    FROM products
    WHERE id = ?
  `;

  db.query(
    productQuery,
    [productId],
    (productErr, products) => {
      if (productErr) {
        console.error(
          "Product lookup error:",
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
          message: "Product not found"
        });
      }

      // Check buyer purchased the product
      const purchaseQuery = `
        SELECT oi.id
        FROM order_items oi
        JOIN orders o
          ON oi.order_id = o.id
        WHERE o.user_id = ?
          AND oi.product_id = ?
        LIMIT 1
      `;

      db.query(
        purchaseQuery,
        [req.user.id, productId],
        (purchaseErr, purchases) => {
          if (purchaseErr) {
            console.error(
              "Purchase lookup error:",
              purchaseErr
            );

            return res.status(500).json({
              success: false,
              message: "Failed to verify purchase"
            });
          }

          if (purchases.length === 0) {
            return res.status(403).json({
              success: false,
              message:
                "You can only review products you purchased"
            });
          }

          // Create review
          const insertQuery = `
            INSERT INTO reviews
            (
              product_id,
              buyer_id,
              rating,
              comment
            )
            VALUES (?, ?, ?, ?)
          `;

          db.query(
            insertQuery,
            [
              productId,
              req.user.id,
              rating,
              comment
            ],
            (insertErr, result) => {
              if (insertErr) {
                console.error(
                  "Create review error:",
                  insertErr
                );

                if (
                  insertErr.code === "ER_DUP_ENTRY"
                ) {
                  return res.status(409).json({
                    success: false,
                    message:
                      "You have already reviewed this product"
                  });
                }

                return res.status(500).json({
                  success: false,
                  message: "Failed to create review"
                });
              }

              return res.status(201).json({
                success: true,
                message:
                  "Review created successfully",
                review_id: result.insertId
              });
            }
          );
        }
      );
    }
  );
};


// ==========================================
// GET PRODUCT REVIEWS - PUBLIC
// ==========================================

const getProductReviews = (req, res) => {
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
      reviews.id,
      reviews.product_id,
      reviews.buyer_id,
      users.name AS buyer_name,
      reviews.rating,
      reviews.comment,
      reviews.created_at,
      reviews.updated_at
    FROM reviews
    JOIN users
      ON reviews.buyer_id = users.id
    WHERE reviews.product_id = ?
    ORDER BY reviews.created_at DESC
  `;

  db.query(
    query,
    [productId],
    (err, reviews) => {
      if (err) {
        console.error(
          "Get reviews error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to fetch reviews"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reviews fetched successfully",
        reviews
      });
    }
  );
};


// ==========================================
// DELETE REVIEW - BUYER OWNER
// ==========================================

const deleteReview = (req, res) => {
  const reviewId = Number(req.params.id);

  if (
    !Number.isInteger(reviewId) ||
    reviewId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid review ID"
    });
  }

  const query = `
    DELETE FROM reviews
    WHERE id = ?
      AND buyer_id = ?
  `;

  db.query(
    query,
    [reviewId, req.user.id],
    (err, result) => {
      if (err) {
        console.error(
          "Delete review error:",
          err
        );

        return res.status(500).json({
          success: false,
          message: "Failed to delete review"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found or access denied"
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Review deleted successfully"
      });
    }
  );
};


module.exports = {
  createReview,
  getProductReviews,
  deleteReview
};
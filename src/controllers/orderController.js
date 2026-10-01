const db = require("../../db");

// CREATE ORDER FROM CART - TRANSACTION SAFE
const createOrder = (req, res) => {
  const userId = req.user.id;
  const { shipping_address } = req.body;

  if (!shipping_address || !shipping_address.trim()) {
    return res.status(400).json({
      message: "Shipping address is required"
    });
  }

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);

      return res.status(500).json({
        message: "Database connection failed"
      });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Transaction start error:", err);
        connection.release();

        return res.status(500).json({
          message: "Failed to start transaction"
        });
      }

      const cartQuery = `
        SELECT
          cart_items.product_id,
          cart_items.quantity,
          products.price,
          products.vendor_id,
          inventory.stock_quantity
        FROM cart_items
        JOIN products
          ON cart_items.product_id = products.id
        JOIN inventory
          ON products.id = inventory.product_id
        WHERE cart_items.user_id = ?
        FOR UPDATE
      `;

      connection.query(
        cartQuery,
        [userId],
        (err, cartItems) => {
          if (err) {
            console.error("Cart fetch error:", err);

            return connection.rollback(() => {
              connection.release();

              res.status(500).json({
                message: "Failed to fetch cart"
              });
            });
          }

          if (cartItems.length === 0) {
            return connection.rollback(() => {
              connection.release();

              res.status(400).json({
                message: "Cart is empty"
              });
            });
          }

          for (const item of cartItems) {
            if (
              Number(item.stock_quantity) <
              Number(item.quantity)
            ) {
              return connection.rollback(() => {
                connection.release();

                res.status(400).json({
                  message: "Insufficient stock",
                  product_id: item.product_id,
                  available_stock: item.stock_quantity,
                  requested_quantity: item.quantity
                });
              });
            }
          }

          const totalAmount = cartItems.reduce(
            (total, item) =>
              total +
              Number(item.price) *
                Number(item.quantity),
            0
          );

          const orderQuery = `
            INSERT INTO orders
            (
              user_id,
              total_amount,
              status,
              shipping_address
            )
            VALUES (?, ?, 'pending', ?)
          `;

          connection.query(
            orderQuery,
            [
              userId,
              totalAmount,
              shipping_address.trim()
            ],
            (err, orderResult) => {
              if (err) {
                console.error(
                  "Order creation error:",
                  err
                );

                return connection.rollback(() => {
                  connection.release();

                  res.status(500).json({
                    message: "Failed to create order"
                  });
                });
              }

              const orderId = orderResult.insertId;

              const vendorSubtotals = {};

              cartItems.forEach((item) => {
                if (!vendorSubtotals[item.vendor_id]) {
                  vendorSubtotals[item.vendor_id] = 0;
                }

                vendorSubtotals[item.vendor_id] +=
                  Number(item.price) *
                  Number(item.quantity);
              });

              const vendorOrderValues =
                Object.entries(vendorSubtotals).map(
                  ([vendorId, subtotal]) => [
                    orderId,
                    Number(vendorId),
                    subtotal
                  ]
                );

              const vendorOrdersQuery = `
                INSERT INTO vendor_orders
                (
                  order_id,
                  vendor_id,
                  subtotal
                )
                VALUES ?
              `;

              connection.query(
                vendorOrdersQuery,
                [vendorOrderValues],
                (err) => {
                  if (err) {
                    console.error(
                      "Vendor sub-order error:",
                      err
                    );

                    return connection.rollback(() => {
                      connection.release();

                      res.status(500).json({
                        message:
                          "Failed to create vendor sub-orders"
                      });
                    });
                  }

                  const orderItemsValues =
                    cartItems.map((item) => [
                      orderId,
                      item.product_id,
                      item.quantity,
                      item.price
                    ]);

                  const orderItemsQuery = `
                    INSERT INTO order_items
                    (
                      order_id,
                      product_id,
                      quantity,
                      price
                    )
                    VALUES ?
                  `;

                  connection.query(
                    orderItemsQuery,
                    [orderItemsValues],
                    (err) => {
                      if (err) {
                        console.error(
                          "Order items error:",
                          err
                        );

                        return connection.rollback(() => {
                          connection.release();

                          res.status(500).json({
                            message:
                              "Failed to create order items"
                          });
                        });
                      }

                      let completedUpdates = 0;
                      let stockUpdateFailed = false;

                      cartItems.forEach((item) => {
                        const updateStockQuery = `
                          UPDATE inventory
                          SET stock_quantity =
                            stock_quantity - ?
                          WHERE product_id = ?
                            AND stock_quantity >= ?
                        `;

                        connection.query(
                          updateStockQuery,
                          [
                            item.quantity,
                            item.product_id,
                            item.quantity
                          ],
                          (err, result) => {
                            if (stockUpdateFailed) {
                              return;
                            }

                            if (err) {
                              stockUpdateFailed = true;

                              console.error(
                                "Stock update error:",
                                err
                              );

                              return connection.rollback(
                                () => {
                                  connection.release();

                                  res.status(500).json({
                                    message:
                                      "Failed to update stock"
                                  });
                                }
                              );
                            }

                            if (
                              result.affectedRows === 0
                            ) {
                              stockUpdateFailed = true;

                              return connection.rollback(
                                () => {
                                  connection.release();

                                  res.status(400).json({
                                    message:
                                      "Insufficient stock",
                                    product_id:
                                      item.product_id
                                  });
                                }
                              );
                            }

                            completedUpdates++;

                            if (
                              completedUpdates ===
                              cartItems.length
                            ) {
                              const clearCartQuery = `
                                DELETE FROM cart_items
                                WHERE user_id = ?
                              `;

                              connection.query(
                                clearCartQuery,
                                [userId],
                                (err) => {
                                  if (err) {
                                    console.error(
                                      "Clear cart error:",
                                      err
                                    );

                                    return connection.rollback(
                                      () => {
                                        connection.release();

                                        res.status(500).json({
                                          message:
                                            "Failed to clear cart"
                                        });
                                      }
                                    );
                                  }

                                  connection.commit(
                                    (err) => {
                                      if (err) {
                                        console.error(
                                          "Commit error:",
                                          err
                                        );

                                        return connection.rollback(
                                          () => {
                                            connection.release();

                                            res.status(500).json({
                                              message:
                                                "Failed to complete order"
                                            });
                                          }
                                        );
                                      }

                                      connection.release();

                                      res.status(201).json({
                                        message:
                                          "Order created successfully",
                                        order_id: orderId,
                                        total_amount:
                                          totalAmount,
                                        vendor_count:
                                          Object.keys(
                                            vendorSubtotals
                                          ).length
                                      });
                                    }
                                  );
                                }
                              );
                            }
                          }
                        );
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};


// GET MY ORDERS
const getMyOrders = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT
      id,
      total_amount,
      status,
      shipping_address,
      created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, orders) => {
    if (err) {
      console.error("Get orders error:", err);

      return res.status(500).json({
        message: "Failed to fetch orders"
      });
    }

    res.status(200).json({
      message: "Orders fetched successfully",
      orders
    });
  });
};


// GET SINGLE ORDER - BUYER WITH TRACKING DETAILS
const getOrderById = (req, res) => {
  const userId = req.user.id;
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({
      message: "Invalid order ID"
    });
  }

  const orderQuery = `
    SELECT
      id,
      user_id,
      total_amount,
      status,
      shipping_address,
      created_at
    FROM orders
    WHERE id = ?
      AND user_id = ?
  `;

  db.query(
    orderQuery,
    [orderId, userId],
    (err, orders) => {
      if (err) {
        console.error("Get order error:", err);

        return res.status(500).json({
          message: "Failed to fetch order"
        });
      }

      if (orders.length === 0) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      const itemsQuery = `
        SELECT
          order_items.id,
          order_items.product_id,
          order_items.quantity,
          order_items.price,
          products.title AS product_title,
          products.vendor_id
        FROM order_items
        JOIN products
          ON order_items.product_id = products.id
        WHERE order_items.order_id = ?
      `;

      db.query(
        itemsQuery,
        [orderId],
        (err, items) => {
          if (err) {
            console.error(
              "Order items fetch error:",
              err
            );

            return res.status(500).json({
              message: "Failed to fetch order items"
            });
          }

          const trackingQuery = `
            SELECT
              vendor_orders.id AS vendor_order_id,
              vendor_orders.vendor_id,
              vendor_orders.subtotal AS vendor_subtotal,
              vendor_orders.status AS vendor_order_status,
              vendor_orders.tracking_number
            FROM vendor_orders
            WHERE vendor_orders.order_id = ?
            ORDER BY vendor_orders.id
          `;

          db.query(
            trackingQuery,
            [orderId],
            (err, vendorOrders) => {
              if (err) {
                console.error(
                  "Tracking details error:",
                  err
                );

                return res.status(500).json({
                  message:
                    "Failed to fetch tracking details"
                });
              }

              res.status(200).json({
                message:
                  "Order fetched successfully",
                order: orders[0],
                items,
                vendor_orders: vendorOrders
              });
            }
          );
        }
      );
    }
  );
};


// UPDATE ORDER STATUS - ADMIN
const updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled"
  ];

  if (!status) {
    return res.status(400).json({
      message: "Order status is required"
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status",
      allowed_statuses: allowedStatuses
    });
  }

  const query = `
    UPDATE orders
    SET status = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [status, orderId],
    (err, result) => {
      if (err) {
        console.error(
          "Update order status error:",
          err
        );

        return res.status(500).json({
          message: "Failed to update order status"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      res.status(200).json({
        message:
          "Order status updated successfully",
        order_id: Number(orderId),
        status
      });
    }
  );
};


// GET VENDOR ORDERS
const getVendorOrders = (req, res) => {
  const vendorId = req.user.id;

  const query = `
    SELECT
      orders.id AS order_id,
      orders.user_id,
      orders.total_amount,
      orders.status,
      orders.shipping_address,
      orders.created_at,

      vendor_orders.id AS vendor_order_id,
      vendor_orders.subtotal AS vendor_subtotal,
      vendor_orders.status AS vendor_order_status,
      vendor_orders.tracking_number,

      order_items.id AS order_item_id,
      order_items.product_id,
      order_items.quantity,
      order_items.price,
      products.title AS product_title

    FROM vendor_orders

    JOIN orders
      ON vendor_orders.order_id = orders.id

    JOIN order_items
      ON orders.id = order_items.order_id

    JOIN products
      ON order_items.product_id = products.id

    WHERE vendor_orders.vendor_id = ?
      AND products.vendor_id = ?

    ORDER BY orders.created_at DESC
  `;

  db.query(
    query,
    [vendorId, vendorId],
    (err, orders) => {
      if (err) {
        console.error(
          "Get vendor orders error:",
          err
        );

        return res.status(500).json({
          message: "Failed to fetch vendor orders"
        });
      }

      res.status(200).json({
        message:
          "Vendor orders fetched successfully",
        orders
      });
    }
  );
};


// UPDATE VENDOR ORDER STATUS + TRACKING
const updateVendorOrderStatus = (req, res) => {
  const vendorOrderId = Number(req.params.id);
  const { status, tracking_number } = req.body;

  const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
  ];

  if (
    !Number.isInteger(vendorOrderId) ||
    vendorOrderId <= 0
  ) {
    return res.status(400).json({
      message: "Invalid vendor order ID"
    });
  }

  if (
    !status ||
    typeof status !== "string" ||
    !allowedStatuses.includes(status.toLowerCase())
  ) {
    return res.status(400).json({
      message:
        "Invalid status. Allowed statuses: pending, processing, shipped, delivered, cancelled"
    });
  }

  const newStatus = status.toLowerCase();

  if (
    tracking_number !== undefined &&
    tracking_number !== null &&
    (
      typeof tracking_number !== "string" ||
      tracking_number.trim() === ""
    )
  ) {
    return res.status(400).json({
      message: "Invalid tracking number"
    });
  }

  const findQuery = `
    SELECT
      id,
      status,
      tracking_number
    FROM vendor_orders
    WHERE id = ?
      AND vendor_id = ?
  `;

  db.query(
    findQuery,
    [vendorOrderId, req.user.id],
    (err, orders) => {
      if (err) {
        console.error(
          "Vendor order lookup error:",
          err
        );

        return res.status(500).json({
          message: "Failed to find vendor order"
        });
      }

      if (orders.length === 0) {
        return res.status(404).json({
          message:
            "Vendor order not found or access denied"
        });
      }

      const currentStatus = orders[0].status;

      const transitions = {
        pending: [
          "pending",
          "processing",
          "cancelled"
        ],

        processing: [
          "processing",
          "shipped",
          "cancelled"
        ],

        shipped: [
          "shipped",
          "delivered"
        ],

        delivered: [
          "delivered"
        ],

        cancelled: [
          "cancelled"
        ]
      };

      if (
        !transitions[currentStatus] ||
        !transitions[currentStatus].includes(newStatus)
      ) {
        return res.status(400).json({
          message:
            `Invalid status transition from ${currentStatus} to ${newStatus}`
        });
      }

      if (
        newStatus === "shipped" &&
        (
          !tracking_number ||
          tracking_number.trim() === ""
        )
      ) {
        return res.status(400).json({
          message:
            "Tracking number is required when order is shipped"
        });
      }

      const updateQuery = `
        UPDATE vendor_orders
        SET
          status = ?,
          tracking_number =
            COALESCE(?, tracking_number)
        WHERE id = ?
          AND vendor_id = ?
      `;

      db.query(
        updateQuery,
        [
          newStatus,
          tracking_number
            ? tracking_number.trim()
            : null,
          vendorOrderId,
          req.user.id
        ],
        (updateErr) => {
          if (updateErr) {
            console.error(
              "Vendor order update error:",
              updateErr
            );

            return res.status(500).json({
              message:
                "Failed to update vendor order"
            });
          }

          return res.status(200).json({
            message:
              "Vendor order updated successfully",
            vendor_order_id: vendorOrderId,
            status: newStatus,
            tracking_number:
              tracking_number ||
              orders[0].tracking_number ||
              null
          });
        }
      );
    }
  );
};

// GET ALL ORDERS - ADMIN
const getAllOrders = (req, res) => {
  const query = `
    SELECT
      orders.id,
      orders.user_id,
      users.name AS customer_name,
      users.email AS customer_email,
      orders.total_amount,
      orders.status,
      orders.shipping_address,
      orders.created_at
    FROM orders
    JOIN users
      ON orders.user_id = users.id
    ORDER BY orders.created_at DESC
  `;

  db.query(query, (err, orders) => {
    if (err) {
      console.error(
        "Admin get all orders error:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders
    });
  });
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getVendorOrders,
  updateVendorOrderStatus
};
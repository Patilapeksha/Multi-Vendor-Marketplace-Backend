const db = require("./db");

const vendorId = 5;

const query = `
  SELECT
    orders.id AS order_id,
    orders.user_id,
    orders.total_amount,
    orders.status,
    orders.shipping_address,
    orders.created_at,

    vendor_orders.id AS vendor_order_id,
    vendor_orders.vendor_id,
    vendor_orders.subtotal AS vendor_subtotal,
    vendor_orders.status AS vendor_order_status,
    vendor_orders.tracking_number,

    order_items.product_id,
    order_items.quantity,
    order_items.price,
    products.title AS product_title,
    products.vendor_id AS product_vendor_id

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

db.query(query, [vendorId, vendorId], (err, results) => {
  if (err) {
    console.error("ERROR:");
    console.error(err);
    process.exit(1);
  }

  console.log("VENDOR ORDERS:");
  console.log(JSON.stringify(results, null, 2));

  process.exit(0);
});
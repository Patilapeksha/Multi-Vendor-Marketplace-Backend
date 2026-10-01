const db = require("./db");

const orderId = 14;

const query = `
  SELECT
    orders.id AS order_id,
    orders.user_id,
    orders.total_amount,
    orders.status,
    orders.shipping_address,

    order_items.id AS order_item_id,
    order_items.product_id,
    order_items.quantity,
    order_items.price,

    products.title,
    products.vendor_id

  FROM orders

  LEFT JOIN order_items
    ON orders.id = order_items.order_id

  LEFT JOIN products
    ON order_items.product_id = products.id

  WHERE orders.id = ?
`;

db.query(query, [orderId], (err, results) => {
  if (err) {
    console.error("ERROR:");
    console.error(err);
    process.exit(1);
  }

  console.log("ORDER 14:");
  console.log(JSON.stringify(results, null, 2));

  process.exit(0);
});
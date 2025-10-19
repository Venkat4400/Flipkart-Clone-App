// server.js
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ MySQL connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",            // change if needed
  password: "venkat2004",  // replace with your MySQL Workbench password
  database: "flipkart_clone"
});

// test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// ✅ Add to cart API
app.post("/api/cart", async (req, res) => {
  try {
    const { userId, name, price, img, quantity } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM cart_items WHERE user_id=? AND product_name=?",
      [userId, name]
    );

    if (rows.length > 0) {
      await db.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE id=?",
        [quantity, rows[0].id]
      );
    } else {
      await db.query(
        "INSERT INTO cart_items (user_id, product_name, price, img, quantity) VALUES (?,?,?,?,?)",
        [userId, name, price, img, quantity]
      );
    }

    res.json({ message: "Item stored in DB!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ Get cart items
app.get("/api/cart/:userId", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM cart_items WHERE user_id=?",
    [req.params.userId]
  );
  res.json(rows);
});

// ✅ Buy API (place order)
app.post("/api/buy", async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    // calculate total
    let total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // create new order
    const [orderResult] = await db.query(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [userId, total]
    );

    const orderId = orderResult.insertId;

    // insert items into order_items
    for (let item of cartItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)",
        [orderId, item.name, item.price, item.quantity]
      );
    }

    res.json({ message: "Order placed successfully!", orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ Start server at the very end
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));


//backend is working!

const bcrypt = require("bcryptjs");

// Registration endpoint
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashed]
    );
    res.json({ message: "User registered!" });
  } catch (err) {
    res.status(500).json({ error: "User registration error" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ message: "Login successful!", userId: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

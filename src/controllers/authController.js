const db = require("../../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= LOGIN =================

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Database error"
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const user = results[0];

      if (!user.is_active) {
        return res.status(403).json({
          message: "Account is inactive"
        });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "15m"
        }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  );
};


// ================= REGISTER =================

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Name, email, password and role are required"
    });
  }

  // Only buyer and vendor can register themselves
  if (!["buyer", "vendor"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role"
    });
  }

  try {
    // Check if email already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Database error"
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message: "Email already registered"
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        db.query(
          `INSERT INTO users
          (name, email, password, role, is_active)
          VALUES (?, ?, ?, ?, ?)`,
          [
            name,
            email,
            hashedPassword,
            role,
            1
          ],
          (insertErr, result) => {
            if (insertErr) {
              console.error(insertErr);

              return res.status(500).json({
                message: "Registration failed"
              });
            }

            return res.status(201).json({
              message: "Registration successful",
              user: {
                id: result.insertId,
                name,
                email,
                role
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};


module.exports = {
  login,
  register
};
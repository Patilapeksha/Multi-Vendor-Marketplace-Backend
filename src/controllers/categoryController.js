const db = require("../../db");

// GET ALL CATEGORIES - PUBLIC
const getCategories = (req, res) => {
  const query = `
    SELECT
      id,
      name,
      description,
      created_at
    FROM categories
    ORDER BY name ASC
  `;

  db.query(query, (err, categories) => {
    if (err) {
      console.error("Get categories error:", err);

      return res.status(500).json({
        message: "Failed to fetch categories"
      });
    }

    res.status(200).json({
      message: "Categories fetched successfully",
      categories
    });
  });
};


// CREATE CATEGORY - ADMIN
const createCategory = (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Category name is required"
    });
  }

  const query = `
    INSERT INTO categories
    (name, description)
    VALUES (?, ?)
  `;

  db.query(
    query,
    [
      name.trim(),
      description ? description.trim() : null
    ],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            message: "Category already exists"
          });
        }

        console.error("Create category error:", err);

        return res.status(500).json({
          message: "Failed to create category"
        });
      }

      res.status(201).json({
        message: "Category created successfully",
        category: {
          id: result.insertId,
          name: name.trim(),
          description: description
            ? description.trim()
            : null
        }
      });
    }
  );
};


// UPDATE CATEGORY - ADMIN
const updateCategory = (req, res) => {
  const categoryId = req.params.id;
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Category name is required"
    });
  }

  const query = `
    UPDATE categories
    SET
      name = ?,
      description = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      name.trim(),
      description ? description.trim() : null,
      categoryId
    ],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            message: "Category name already exists"
          });
        }

        console.error("Update category error:", err);

        return res.status(500).json({
          message: "Failed to update category"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Category not found"
        });
      }

      res.status(200).json({
        message: "Category updated successfully"
      });
    }
  );
};


// DELETE CATEGORY - ADMIN
const deleteCategory = (req, res) => {
  const categoryId = req.params.id;

  const query = `
    DELETE FROM categories
    WHERE id = ?
  `;

  db.query(query, [categoryId], (err, result) => {
    if (err) {
      console.error("Delete category error:", err);

      return res.status(500).json({
        message: "Failed to delete category"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.status(200).json({
      message: "Category deleted successfully"
    });
  });
};


module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
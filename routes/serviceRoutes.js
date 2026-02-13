const express = require("express");
const router = express.Router();

const {
  createService,
  updateService,
  deleteService,
  getAllServices,
  getServiceById,
} = require("../controllers/serviceController");

const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", protect, admin, getAllServices);
router.get("/:id", protect, admin, getServiceById);


// Admin routes
router.post("/", protect, admin, createService);
router.put("/:id", protect, admin, updateService);
router.delete("/:id", protect, admin, deleteService);

module.exports = router;

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const {
  getAllUsers,
  uploadProfilePicture,
} = require("../controllers/userController");

// Get logged-in user profile
router.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    user: req.user,
  });
});

// Get all users
router.get("/all", authMiddleware, getAllUsers);

// Upload profile picture
router.post(
  "/upload-profile",
  authMiddleware,
  upload.single("profilePic"),
  uploadProfilePicture
);

module.exports = router;
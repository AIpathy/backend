const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { authenticateToken } = require("../middleware/auth"); // ✅ Doğru olan bu
const { uploadTest } = require("../controllers/uploadController");

router.post("/", authenticateToken, upload.single("file"), uploadTest);

module.exports = router;

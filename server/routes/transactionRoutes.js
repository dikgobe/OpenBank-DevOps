const express = require("express");
const router = express.Router();
const { 
  getTransactions, 
  createTransaction, 
  getAccountBalance 
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router.route("/")
  .get(getTransactions)
  .post(createTransaction);

router.get("/balance/:accountType", getAccountBalance);

module.exports = router;
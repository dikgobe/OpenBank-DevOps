const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// @desc    Get user transaction history
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get specific account balance
// @route   GET /api/transactions/balance/:accountType
// @access  Private
const getAccountBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accountType = req.params.accountType.toLowerCase();
    
    // Check if account exists
    if (user.balances[accountType] === undefined) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    res.status(200).json({
      account: accountType.charAt(0).toUpperCase() + accountType.slice(1),
      balance: user.balances[accountType]
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a transaction (deposit, withdrawal, transfer)
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  const { type, amount, title, accountType, toAccountType, description } = req.body;
  const userId = req.user.id;

  // Use a MongoDB Session for atomic updates (ACID)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
        throw new Error("User not found");
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        res.status(400);
        throw new Error("Invalid amount");
    }

    const accKey = accountType ? accountType.toLowerCase() : null;
    
    // Validate account existence
    if (!accKey || user.balances[accKey] === undefined) {
        res.status(400);
        throw new Error("Invalid account type");
    }

    // --- Logic based on Transaction Type ---
    if (type === "deposit") {
        user.balances[accKey] += numAmount;
    } 
    else if (type === "withdrawal") {
        if (user.balances[accKey] < numAmount) {
            res.status(400);
            throw new Error("Insufficient funds");
        }
        user.balances[accKey] -= numAmount;
    } 
    else if (type === "transfer") {
        const toKey = toAccountType ? toAccountType.toLowerCase() : null;
        if (!toKey || user.balances[toKey] === undefined) {
            res.status(400);
            throw new Error("Invalid destination account");
        }
        if (accKey === toKey) {
            res.status(400);
            throw new Error("Cannot transfer to same account");
        }
        if (user.balances[accKey] < numAmount) {
            res.status(400);
            throw new Error("Insufficient funds");
        }

        // Deduct from Source
        user.balances[accKey] -= numAmount;
        // Add to Destination
        user.balances[toKey] += numAmount;
    } else {
        res.status(400);
        throw new Error("Invalid transaction type");
    }

    // Save Updated User Balances
    await user.save({ session });

    // Format display string
    const formattedAmount = `${type === "withdrawal" ? "-" : (type === "transfer" ? "" : "+")}R${numAmount.toFixed(2)}`;
    
    // Capitalize helper
    const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

    // Create Transaction Record
    const transaction = new Transaction({
        user: userId,
        type,
        amount: numAmount,
        displayAmount: formattedAmount,
        title: title || description || `${cap(type)} transaction`,
        account: cap(accKey),
        fromAccount: type === "transfer" ? cap(accKey) : undefined,
        toAccount: type === "transfer" ? cap(toAccountType) : undefined
    });

    await transaction.save({ session });

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
        success: true,
        balances: user.balances,
        transaction
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  getAccountBalance
};
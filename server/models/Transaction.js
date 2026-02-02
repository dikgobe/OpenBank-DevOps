const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    user: String,
    amount: Number,
    type: { type: String, enum: ['deposit', 'withdraw'] },
    date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Transaction', TransactionSchema);
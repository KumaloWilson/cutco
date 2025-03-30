import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema({
  hash: String,
  sender: String,
  recipient: String,
  amount: Number,
  timestamp: Number,
});

const AccountSchema = new Schema({
  name: String,
  phone_number: String,
  balance: Number,
});

export const Account =
  mongoose.models.User || mongoose.model("Account", AccountSchema);
export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

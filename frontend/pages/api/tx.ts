// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import connectDB from "@/lib/db";
import { Account, Transaction as TransactionModel } from "@/lib/schema";
import type { NextApiRequest, NextApiResponse } from "next";
import { Transaction } from "../types";
import * as crypto from "node:crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Transaction[] | Transaction>
) {
  await connectDB();

  // if get, return all tx
  if (req.method === "GET") {
    const transactions = await TransactionModel.find();
    return res.json(transactions);
  }
  // is post create new tx
  if (req.method === "POST") {
    const { body }: { body: Omit<Transaction, "hash"> } = req;
    const hasher = await crypto.createHash("sha256");
    const hash = hasher.update(JSON.stringify(body)).digest("base64");

    const savedTx = await TransactionModel.create({
      ...body,
      hash,
    });

    await Account.updateOne(
      { phone_number: body.sender },
      { $sub: { balance: body.amount } }
    );

    return savedTx._id;
  }
}

/**
 * Represents a transaction in the system.
 */
export type Transaction = {
  /**
   * The hash of the transaction.
   */
  hash: string;

  /**
   * The sender of the transaction.
   */
  sender: string;

  /**
   * The recipient of the transaction.
   */
  recipient: string;

  /**
   * The amount of the transaction.
   */
  amount: number;

  /**
   * The timestamp of the transaction.
   */
  timestamp: number;

  /**
   * The tuckshop associated with the transaction.
   */
  node: "A" | "B" | "C" | "D" | "V" | "W" | "X" | "Y";
};

export type Account = {
  /**
   * The address of the account.
   */
  phone_number: string;

  /**
   * The balance of the account.
   */
  balance: number;

  /**
   * The transactions of the account.
   */
  transactions: Transaction[];
};

export type Tuckshop = {
  /**
   * The name of the tuckshop.
   */
  name: string;

  /**
   * The balance of the tuckshop.
   */
  api_key: string;

  /**
   * The balance of the tuckshop.
   */
  balance: number;

  /**
   * The transactions of the tuckshop.
   */
  transactions: Transaction[];
};

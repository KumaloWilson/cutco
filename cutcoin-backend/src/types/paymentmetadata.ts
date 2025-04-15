import { Model, DataTypes } from "sequelize"

export interface PaymentMetadata {
  pollUrl?: string
  redirectUrl?: string
  error?: string
  merchantDepositId?: number
  isMerchantDeposit: boolean
}

import { Model, DataTypes } from "sequelize"


export interface PaymentMetadata {
  pollUrl?: string
  redirectUrl?: string
  error?: string
  isMerchantDeposit?: boolean
  merchantDepositId?: number
  status?: string
  lastUpdated?: Date
}
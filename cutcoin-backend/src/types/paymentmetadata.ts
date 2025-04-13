import { Model, DataTypes } from "sequelize"
import { sequelize } from "../app"

export interface PaymentMetadata {
  pollUrl?: string
  redirectUrl?: string
  error?: string
  merchantDepositId?: number
}

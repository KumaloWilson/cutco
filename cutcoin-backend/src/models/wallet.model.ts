import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"

@Table({
  tableName: "wallets",
  timestamps: true,
})
export class Wallet extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number

  @Column({
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
    defaultValue: 0,
  })
  balance!: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  walletAddress!: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean

  @BelongsTo(() => User)
  user!: User
}

export default Wallet

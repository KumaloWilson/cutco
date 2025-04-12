import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, HasOne } from "sequelize-typescript"
import bcrypt from "bcrypt"
import { Wallet } from "./wallet.model"
import { Merchant } from "./merchant.model"

@Table({
  tableName: "users",
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  })
  studentId!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  })
  phoneNumber!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  pin!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string

  @Column({
    type: DataType.ENUM,
    values: ["pending", "verified", "rejected"],
    defaultValue: "pending",
  })
  kycStatus!: string

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  kycData!: object

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  deviceId!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fcmToken!: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLogin!: Date

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email!: string

  @HasOne(() => Wallet)
  wallet!: Wallet

  @HasOne(() => Merchant)
  merchant!: Merchant

  @BeforeCreate
  @BeforeUpdate
  static async hashPin(instance: User) {
    if (instance.changed("pin")) {
      const salt = await bcrypt.genSalt(10)
      instance.pin = await bcrypt.hash(instance.pin, salt)
    }
  }

  async validatePin(pin: string): Promise<boolean> {
    return bcrypt.compare(pin, this.pin)
  }

  async getMerchant(): Promise<Merchant | null> {
    return Merchant.findOne({ where: { userId: this.id } })
  }
}

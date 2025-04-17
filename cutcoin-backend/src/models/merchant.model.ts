import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BeforeCreate, BeforeSave } from "sequelize-typescript"
import { User } from "./user.model"
import { generateMerchantNumber } from "../utils/generators"
import bcrypt from "bcrypt"

@Table({
  tableName: "merchants",
  timestamps: true,
})
export class Merchant extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // Changed to allow null for direct merchant registration
  })
  userId!: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  merchantNumber!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  contactPerson!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  contactPhone!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string

  @Column({
    type: DataType.ENUM,
    values: ["pending", "approved", "rejected", "suspended"],
    defaultValue: "pending",
  })
  status!: string

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

  @BelongsTo(() => User)
  user!: User

  @BeforeCreate
  static async generateMerchantNumber(instance: Merchant) {
    if (!instance.merchantNumber) {
      instance.merchantNumber = await generateMerchantNumber()
    }
  }

  @BeforeSave
  static async hashPassword(instance: Merchant) {
    // Only hash the password if it's changed
    if (instance.changed("password")) {
      const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
      instance.password = await bcrypt.hash(instance.password, saltRounds)
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}

export default Merchant

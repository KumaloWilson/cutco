import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate } from "sequelize-typescript"
import bcrypt from "bcrypt"

@Table({
  tableName: "admins",
  timestamps: true,
})
export class Admin extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  username!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullName!: string

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
  phoneNumber!: string

  @Column({
    type: DataType.ENUM,
    values: ["super_admin", "admin", "support"],
    defaultValue: "admin",
  })
  role!: string

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

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: Admin) {
    if (instance.changed("password")) {
      const salt = await bcrypt.genSalt(10)
      instance.password = await bcrypt.hash(instance.password, salt)
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}

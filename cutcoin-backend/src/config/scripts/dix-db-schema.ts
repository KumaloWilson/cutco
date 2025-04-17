import { Sequelize, QueryTypes } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

async function fixDatabaseSchema() {
  const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: console.log,
  })

  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")

    // Check if otps table exists
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'otps'",
      { type: QueryTypes.SELECT },
    )

    if (tables.length === 0) {
      console.log("The otps table does not exist. Please run the initial migrations first.")
      return
    }

    // Check columns in otps table
    const columns = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'otps'`,
      { type: QueryTypes.SELECT },
    )

    const columnNames = columns.map((col: any) => col.column_name)
    console.log("Columns in otps table:", columnNames)

    // Add merchant_id if it doesn't exist
    if (!columnNames.includes("merchant_id")) {
      console.log("Adding merchant_id column to otps table...")
      await sequelize.query(`
        ALTER TABLE otps 
        ADD COLUMN merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL ON UPDATE CASCADE
      `)
    }

    // Add email if it doesn't exist
    if (!columnNames.includes("email")) {
      console.log("Adding email column to otps table...")
      await sequelize.query(`
        ALTER TABLE otps 
        ADD COLUMN email VARCHAR(255)
      `)
    }

    // Make user_id or userId nullable
    if (columnNames.includes("user_id")) {
      console.log("Making user_id nullable...")
      await sequelize.query(`
        ALTER TABLE otps 
        ALTER COLUMN user_id DROP NOT NULL
      `)
    } else if (columnNames.includes("userId")) {
      console.log("Making userId nullable...")
      await sequelize.query(`
        ALTER TABLE otps 
        ALTER COLUMN "userId" DROP NOT NULL
      `)
    }

    // Make phone_number or phoneNumber nullable
    if (columnNames.includes("phone_number")) {
      console.log("Making phone_number nullable...")
      await sequelize.query(`
        ALTER TABLE otps 
        ALTER COLUMN phone_number DROP NOT NULL
      `)
    } else if (columnNames.includes("phoneNumber")) {
      console.log("Making phoneNumber nullable...")
      await sequelize.query(`
        ALTER TABLE otps 
        ALTER COLUMN "phoneNumber" DROP NOT NULL
      `)
    }

    // Check enum types
    const enumValues = await sequelize.query(
      `
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'enum_otps_purpose'
    `,
      { type: QueryTypes.SELECT },
    )

    const enumLabels = enumValues.map((val: any) => val.enumlabel)
    console.log("Current enum values for enum_otps_purpose:", enumLabels)

    // Add missing enum values
    const missingEnums = ["merchant_registration", "merchant_password_reset", "withdrawal"].filter(
      (val) => !enumLabels.includes(val),
    )

    if (missingEnums.length > 0) {
      console.log("Adding missing enum values:", missingEnums)

      for (const enumValue of missingEnums) {
        try {
          await sequelize.query(`
            ALTER TYPE enum_otps_purpose ADD VALUE IF NOT EXISTS '${enumValue}'
          `)
          console.log(`Added enum value: ${enumValue}`)
        } catch (error) {
          console.error(`Error adding enum value ${enumValue}:`, error)
        }
      }
    }

    console.log("Database schema fix completed successfully.")
    await sequelize.close()
  } catch (error) {
    console.error("Error fixing database schema:", error)
  }
}

fixDatabaseSchema()

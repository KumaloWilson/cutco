import { Sequelize, QueryTypes } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

async function insertMigrationMeta() {
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

    // Check if SequelizeMeta table exists
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'SequelizeMeta'",
      { type: QueryTypes.SELECT },
    )

    if (tables.length === 0) {
      console.log("Creating SequelizeMeta table...")
      await sequelize.query(`
        CREATE TABLE "SequelizeMeta" (
          name VARCHAR(255) NOT NULL PRIMARY KEY
        )
      `)
    }

    // Get existing migrations
    const existingMigrations = await sequelize.query('SELECT name FROM "SequelizeMeta"', { type: QueryTypes.SELECT })

    const existingMigrationNames = existingMigrations.map((m: any) => m.name)
    console.log("Existing migrations:", existingMigrationNames)

    // Migrations to insert
    const migrationsToInsert = [
      "07-merchant-auth-fields.ts",
      "08-otp-merchant-id.ts",
      "09-check-merchant-columns.ts",
    ].filter((name) => !existingMigrationNames.includes(name))

    if (migrationsToInsert.length === 0) {
      console.log("No new migrations to insert.")
    } else {
      console.log("Inserting migrations:", migrationsToInsert)

      for (const migrationName of migrationsToInsert) {
        await sequelize.query('INSERT INTO "SequelizeMeta" (name) VALUES (:name)', {
          replacements: { name: migrationName },
          type: QueryTypes.INSERT,
        })
        console.log(`Inserted migration: ${migrationName}`)
      }
    }

    console.log("Migration meta insertion completed successfully.")
    await sequelize.close()
  } catch (error) {
    console.error("Error inserting migration meta:", error)
  }
}

insertMigrationMeta()

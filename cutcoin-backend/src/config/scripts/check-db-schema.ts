import { Sequelize, QueryTypes } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

async function checkDatabaseSchema() {
  const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false, // Set to console.log to see all queries
  })

  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")

    // Get all tables
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
      { type: QueryTypes.SELECT },
    )
    console.log("\nTables in database:", tables.map((t: any) => t.table_name).join(", "))

    // For each table, get its columns
    for (const table of tables) {
      const tableName = (table as any).table_name
      const columns = await sequelize.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = :tableName
         ORDER BY ordinal_position`,
        {
          replacements: { tableName },
          type: QueryTypes.SELECT,
        },
      )

      console.log(`\n=== Columns for ${tableName} ===`)
      columns.forEach((col: any) => {
        console.log(
          `${col.column_name}: ${col.data_type} ${col.is_nullable === "YES" ? "NULL" : "NOT NULL"}${col.column_default ? " DEFAULT " + col.column_default : ""}`,
        )
      })

      // Check for foreign keys
      const foreignKeys = await sequelize.query(
        `SELECT
           kcu.column_name, 
           ccu.table_name AS foreign_table_name,
           ccu.column_name AS foreign_column_name 
         FROM 
           information_schema.table_constraints AS tc 
           JOIN information_schema.key_column_usage AS kcu
             ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
           JOIN information_schema.constraint_column_usage AS ccu 
             ON ccu.constraint_name = tc.constraint_name
             AND ccu.table_schema = tc.table_schema
         WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name=:tableName`,
        {
          replacements: { tableName },
          type: QueryTypes.SELECT,
        },
      )

      if (foreignKeys.length > 0) {
        console.log("\nForeign Keys:")
        foreignKeys.forEach((fk: any) => {
          console.log(`${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name})`)
        })
      }

      // Check for indexes
      const indexes = await sequelize.query(
        `SELECT
           i.relname as index_name,
           a.attname as column_name,
           ix.indisunique as is_unique
         FROM
           pg_class t,
           pg_class i,
           pg_index ix,
           pg_attribute a
         WHERE
           t.oid = ix.indrelid
           AND i.oid = ix.indexrelid
           AND a.attrelid = t.oid
           AND a.attnum = ANY(ix.indkey)
           AND t.relkind = 'r'
           AND t.relname = :tableName
         ORDER BY i.relname`,
        {
          replacements: { tableName },
          type: QueryTypes.SELECT,
        },
      )

      if (indexes.length > 0) {
        console.log("\nIndexes:")
        const indexMap: Record<string, { columns: string[]; isUnique: boolean }> = {}

        indexes.forEach((idx: any) => {
          if (!indexMap[idx.index_name]) {
            indexMap[idx.index_name] = { columns: [], isUnique: idx.is_unique }
          }
          indexMap[idx.index_name].columns.push(idx.column_name)
        })

        Object.entries(indexMap).forEach(([name, { columns, isUnique }]) => {
          console.log(`${name}: ${columns.join(", ")} ${isUnique ? "(UNIQUE)" : ""}`)
        })
      }
    }

    // Check for enum types
    const enumTypes = await sequelize.query(
      `SELECT 
         t.typname as enum_name,
         e.enumlabel as enum_value
       FROM pg_type t 
       JOIN pg_enum e ON t.oid = e.enumtypid  
       JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
       WHERE n.nspname = 'public'
       ORDER BY enum_name, e.enumsortorder`,
      { type: QueryTypes.SELECT },
    )

    if (enumTypes.length > 0) {
      console.log("\n=== Enum Types ===")
      const enumMap: Record<string, string[]> = {}

      enumTypes.forEach((et: any) => {
        if (!enumMap[et.enum_name]) {
          enumMap[et.enum_name] = []
        }
        enumMap[et.enum_name].push(et.enum_value)
      })

      Object.entries(enumMap).forEach(([name, values]) => {
        console.log(`${name}: ${values.join(", ")}`)
      })
    }

    await sequelize.close()
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}

checkDatabaseSchema()

import { Umzug as UmzugType } from 'umzug';
import sequelize from "./sequelize";
import path from "path";
import fs from "fs";

// Import the actual implementations
const { Umzug } = require('umzug');
const { SequelizeStorage } = require('umzug/lib/storage');

// Defined types for migration/seeder resolution
interface MigrationContext {
  name: string;
  path: string;
  context: any;
}

// Initialize Umzug for migrations
const migrator = new Umzug({
  migrations: {
    glob: ["migrations/*.ts", { cwd: __dirname }],
    resolve: ({ name, path, context }: MigrationContext) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.default.up(context),
        down: async () => migration.default.down(context),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Initialize Umzug for seeders
const seeder = new Umzug({
  migrations: {
    glob: ["seeds/*.ts", { cwd: __dirname }],
    resolve: ({ name, path, context }: MigrationContext) => {
      const seeder = require(path);
      return {
        name,
        up: async () => seeder.default.up(context),
        down: async () => seeder.default.down(context),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: "seeder_meta" }),
  logger: console,
});

// Function to display migration/seeder order
function displayFileOrder(type: string, directory: string) {
  const files = fs.readdirSync(path.join(__dirname, directory)).sort();
  console.log(`\n${type} will run in the following order:`);
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  console.log();
}

// Run migrations
async function runMigrations() {
  try {
    // Display migration order
    displayFileOrder("Migrations", "migrations");

    await migrator.up();
    console.log("Migrations executed successfully");
    return true;
  } catch (error) {
    console.error("Error executing migrations:", error);
    return false;
  }
}

// Run seeders
async function runSeeders() {
  try {
    // Display seeder order
    displayFileOrder("Seeders", "seeds");

    await seeder.up();
    console.log("Seeders executed successfully");
    return true;
  } catch (error) {
    console.error("Error executing seeders:", error);
    return false;
  }
}

// Main function to run migrations and seeders
async function migrate() {
  try {
    const migrationsSuccess = await runMigrations();
    if (migrationsSuccess) {
      await runSeeders();
    }
  } catch (error) {
    console.error("Error executing migrations or seeders:", error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log("Migration process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration process failed:", error);
      process.exit(1);
    });
}

export { migrate, runMigrations, runSeeders };
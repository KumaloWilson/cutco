"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
exports.runMigrations = runMigrations;
exports.runSeeders = runSeeders;
const umzug_1 = require("umzug");
const sequelize_1 = __importDefault(require("./sequelize"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Initialize Umzug for migrations
const migrator = new umzug_1.Umzug({
    migrations: {
        glob: ["migrations/*.ts", { cwd: __dirname }],
        resolve: ({ name, path, context }) => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const migration = require(path);
            return {
                name,
                up: async () => migration.default.up(context),
                down: async () => migration.default.down(context),
            };
        },
    },
    context: sequelize_1.default.getQueryInterface(),
    storage: new umzug_1.SequelizeStorage({ sequelize: sequelize_1.default }),
    logger: console,
});
// Initialize Umzug for seeders
const seeder = new umzug_1.Umzug({
    migrations: {
        glob: ["seeds/*.ts", { cwd: __dirname }],
        resolve: ({ name, path, context }) => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const seeder = require(path);
            return {
                name,
                up: async () => seeder.default.up(context),
                down: async () => seeder.default.down(context),
            };
        },
    },
    context: sequelize_1.default.getQueryInterface(),
    storage: new umzug_1.SequelizeStorage({ sequelize: sequelize_1.default, tableName: "seeder_meta" }),
    logger: console,
});
// Function to display migration/seeder order
function displayFileOrder(type, directory) {
    const files = fs_1.default.readdirSync(path_1.default.join(__dirname, directory)).sort();
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
//# sourceMappingURL=migrate.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Merchant = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("./user.model");
const generators_1 = require("../utils/generators");
const bcrypt_1 = __importDefault(require("bcrypt"));
let Merchant = class Merchant extends sequelize_typescript_1.Model {
    static async generateMerchantNumber(instance) {
        if (!instance.merchantNumber) {
            instance.merchantNumber = await (0, generators_1.generateMerchantNumber)();
        }
    }
    static async hashPassword(instance) {
        // Only hash the password if it's changed
        if (instance.changed("password")) {
            const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");
            instance.password = await bcrypt_1.default.hash(instance.password, saltRounds);
        }
    }
    async validatePassword(password) {
        return bcrypt_1.default.compare(password, this.password);
    }
};
exports.Merchant = Merchant;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true, // Changed to allow null for direct merchant registration
        field: "userId", // Explicitly specify the field name
    }),
    __metadata("design:type", Number)
], Merchant.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Merchant.prototype, "merchantNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Merchant.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Merchant.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Merchant.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Merchant.prototype, "contactPerson", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Merchant.prototype, "contactPhone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        unique: true,
    }),
    __metadata("design:type", String)
], Merchant.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Merchant.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM,
        values: ["pending", "approved", "rejected", "suspended"],
        defaultValue: "pending",
    }),
    __metadata("design:type", String)
], Merchant.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
    }),
    __metadata("design:type", Boolean)
], Merchant.prototype, "isActive", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
        field: "last_login", // Explicitly specify the field name
    }),
    __metadata("design:type", Date)
], Merchant.prototype, "lastLogin", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], Merchant.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Merchant]),
    __metadata("design:returntype", Promise)
], Merchant, "generateMerchantNumber", null);
__decorate([
    sequelize_typescript_1.BeforeSave,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Merchant]),
    __metadata("design:returntype", Promise)
], Merchant, "hashPassword", null);
exports.Merchant = Merchant = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "merchants",
        timestamps: true,
    })
], Merchant);
exports.default = Merchant;
//# sourceMappingURL=merchant.model.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantDeposit = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("./user.model");
const merchant_model_1 = require("./merchant.model");
let MerchantDeposit = class MerchantDeposit extends sequelize_typescript_1.Model {
};
exports.MerchantDeposit = MerchantDeposit;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => merchant_model_1.Merchant),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], MerchantDeposit.prototype, "merchantId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], MerchantDeposit.prototype, "studentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(20, 2),
        allowNull: false,
    }),
    __metadata("design:type", Number)
], MerchantDeposit.prototype, "cashAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(20, 2),
        allowNull: false,
    }),
    __metadata("design:type", Number)
], MerchantDeposit.prototype, "cutcoinAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], MerchantDeposit.prototype, "reference", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM,
        values: ["pending", "approved", "rejected", "completed"],
        defaultValue: "pending",
    }),
    __metadata("design:type", String)
], MerchantDeposit.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], MerchantDeposit.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
    }),
    __metadata("design:type", Number)
], MerchantDeposit.prototype, "approvedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Date)
], MerchantDeposit.prototype, "approvedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => merchant_model_1.Merchant),
    __metadata("design:type", merchant_model_1.Merchant)
], MerchantDeposit.prototype, "merchant", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], MerchantDeposit.prototype, "student", void 0);
exports.MerchantDeposit = MerchantDeposit = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "merchant_deposits",
        timestamps: true,
    })
], MerchantDeposit);
exports.default = MerchantDeposit;
//# sourceMappingURL=merchant-deposit.model.js.map
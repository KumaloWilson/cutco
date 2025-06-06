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
exports.OTP = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("./user.model");
const merchant_model_1 = require("./merchant.model");
let OTP = class OTP extends sequelize_typescript_1.Model {
};
exports.OTP = OTP;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: "userId", // Explicitly specify the field name
    }),
    __metadata("design:type", Number)
], OTP.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => merchant_model_1.Merchant),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: "merchant_id", // Explicitly specify the field name
    }),
    __metadata("design:type", Number)
], OTP.prototype, "merchantId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
        field: "phoneNumber", // Explicitly specify the field name
    }),
    __metadata("design:type", String)
], OTP.prototype, "phoneNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], OTP.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], OTP.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM,
        values: [
            "registration",
            "login",
            "password_reset",
            "withdrawal",
            "merchant_registration",
            "merchant_password_reset",
            "transaction",
            "transfer",
            "merchant_transaction",
            "merchant_transfer",
            "merchant_withdrawal",
            "merchant_login",
            "merchant_otp_verification",
            "merchant_otp_verification_resend",
        ],
        allowNull: false,
    }),
    __metadata("design:type", String)
], OTP.prototype, "purpose", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        field: "expiresAt", // Explicitly specify the field name
    }),
    __metadata("design:type", Date)
], OTP.prototype, "expiresAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: false,
        field: "isUsed", // Explicitly specify the field name
    }),
    __metadata("design:type", Boolean)
], OTP.prototype, "isUsed", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], OTP.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => merchant_model_1.Merchant),
    __metadata("design:type", merchant_model_1.Merchant)
], OTP.prototype, "merchant", void 0);
exports.OTP = OTP = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "otps",
        timestamps: true,
    })
], OTP);
exports.default = OTP;
//# sourceMappingURL=otp.model.js.map
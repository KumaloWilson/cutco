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
exports.ConfirmTransferDto = exports.TransferDto = exports.ConfirmWithdrawalOtpDto = exports.InitiateWithdrawalDto = exports.CancelTransactionDto = exports.MerchantConfirmTransactionDto = exports.InitiateDepositDto = void 0;
const class_validator_1 = require("class-validator");
class InitiateDepositDto {
}
exports.InitiateDepositDto = InitiateDepositDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InitiateDepositDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiateDepositDto.prototype, "merchantNumber", void 0);
class MerchantConfirmTransactionDto {
}
exports.MerchantConfirmTransactionDto = MerchantConfirmTransactionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MerchantConfirmTransactionDto.prototype, "reference", void 0);
class CancelTransactionDto {
}
exports.CancelTransactionDto = CancelTransactionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CancelTransactionDto.prototype, "reference", void 0);
class InitiateWithdrawalDto {
}
exports.InitiateWithdrawalDto = InitiateWithdrawalDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InitiateWithdrawalDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiateWithdrawalDto.prototype, "merchantNumber", void 0);
class ConfirmWithdrawalOtpDto {
}
exports.ConfirmWithdrawalOtpDto = ConfirmWithdrawalOtpDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ConfirmWithdrawalOtpDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmWithdrawalOtpDto.prototype, "merchantNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmWithdrawalOtpDto.prototype, "code", void 0);
class TransferDto {
}
exports.TransferDto = TransferDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransferDto.prototype, "recipientId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TransferDto.prototype, "amount", void 0);
class ConfirmTransferDto {
}
exports.ConfirmTransferDto = ConfirmTransferDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmTransferDto.prototype, "recipientId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ConfirmTransferDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmTransferDto.prototype, "code", void 0);
//# sourceMappingURL=wallet.dto.js.map
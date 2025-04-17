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
exports.MerchantDepositFundsDto = exports.MerchantDepositLimitsDto = exports.UpdateExchangeRateDto = exports.InitiateCashDepositDto = exports.InitiatePaynowPaymentDto = void 0;
const class_validator_1 = require("class-validator");
class InitiatePaynowPaymentDto {
}
exports.InitiatePaynowPaymentDto = InitiatePaynowPaymentDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InitiatePaynowPaymentDto.prototype, "amount", void 0);
class InitiateCashDepositDto {
}
exports.InitiateCashDepositDto = InitiateCashDepositDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiateCashDepositDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InitiateCashDepositDto.prototype, "cashAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitiateCashDepositDto.prototype, "notes", void 0);
class UpdateExchangeRateDto {
}
exports.UpdateExchangeRateDto = UpdateExchangeRateDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], UpdateExchangeRateDto.prototype, "rate", void 0);
class MerchantDepositLimitsDto {
}
exports.MerchantDepositLimitsDto = MerchantDepositLimitsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MerchantDepositLimitsDto.prototype, "daily", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MerchantDepositLimitsDto.prototype, "monthly", void 0);
class MerchantDepositFundsDto {
}
exports.MerchantDepositFundsDto = MerchantDepositFundsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], MerchantDepositFundsDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MerchantDepositFundsDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=payment.dto.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaynowService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const system_config_model_1 = require("../models/system-config.model");
const HttpException_1 = require("../exceptions/HttpException");
class PaynowService {
    constructor() {
        // These will be loaded from system config in the init method
        this.integrationId = "";
        this.integrationKey = "";
        this.returnUrl = "";
        this.resultUrl = "";
        this.paynowUrl = "https://www.paynow.co.zw/interface/initiatetransaction";
    }
    async init() {
        try {
            // Load configuration from database
            const configs = await system_config_model_1.SystemConfig.findAll({
                where: {
                    key: ["paynow_integration_id", "paynow_integration_key", "paynow_return_url", "paynow_result_url"],
                    isActive: true,
                },
            });
            // Create a map of configs
            const configMap = {};
            configs.forEach((config) => {
                configMap[config.key] = config.value;
            });
            // Set the values
            this.integrationId = configMap["paynow_integration_id"] || "";
            this.integrationKey = configMap["paynow_integration_key"] || "";
            this.returnUrl = configMap["paynow_return_url"] || "";
            this.resultUrl = configMap["paynow_result_url"] || "";
            if (!this.integrationId || !this.integrationKey) {
                throw new Error("Paynow configuration is incomplete");
            }
        }
        catch (error) {
            console.error("Failed to initialize Paynow service:", error);
            throw new HttpException_1.HttpException(500, "Failed to initialize payment service");
        }
    }
    createHash(values) {
        return crypto_1.default.createHash("md5").update(values).digest("hex").toUpperCase();
    }
    buildQueryString(data) {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            params.append(key, value);
        });
        return params.toString();
    }
    async createPayment(reference, email, amount, description) {
        try {
            await this.init();
            const data = {
                id: this.integrationId,
                reference,
                amount: amount.toString(),
                additionalinfo: description,
                returnurl: this.returnUrl,
                resulturl: this.resultUrl,
                authemail: email,
                status: "Message",
            };
            // Create the hash
            let hashString = "";
            Object.values(data).forEach((value) => {
                hashString += value;
            });
            hashString += this.integrationKey;
            const hash = this.createHash(hashString);
            data.hash = hash;
            // Send request to Paynow
            const response = await axios_1.default.post(this.paynowUrl, this.buildQueryString(data), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            // Parse the response
            const responseData = {};
            response.data.split("&").forEach((pair) => {
                const [key, value] = pair.split("=");
                responseData[key] = value;
            });
            if (responseData.status.toLowerCase() === "ok") {
                return {
                    success: true,
                    redirectUrl: responseData.browserurl,
                    pollUrl: responseData.pollurl,
                };
            }
            else {
                return {
                    success: false,
                    error: responseData.error || "Payment initialization failed",
                };
            }
        }
        catch (error) {
            console.error("Paynow payment creation failed:", error);
            return {
                success: false,
                error: "Payment service unavailable",
            };
        }
    }
    async checkPaymentStatus(pollUrl) {
        try {
            const response = await axios_1.default.get(pollUrl);
            // Parse the response
            const responseData = {};
            response.data.split("&").forEach((pair) => {
                const [key, value] = pair.split("=");
                responseData[key] = value;
            });
            // Verify the hash
            const originalHash = responseData.hash;
            delete responseData.hash;
            let hashString = "";
            Object.values(responseData).forEach((value) => {
                hashString += value;
            });
            hashString += this.integrationKey;
            const calculatedHash = this.createHash(hashString);
            if (calculatedHash !== originalHash) {
                return {
                    paid: false,
                    status: "hash_mismatch",
                };
            }
            return {
                paid: responseData.status.toLowerCase() === "paid",
                status: responseData.status.toLowerCase(),
                reference: responseData.reference,
                amount: Number.parseFloat(responseData.amount),
            };
        }
        catch (error) {
            console.error("Paynow status check failed:", error);
            return {
                paid: false,
                status: "error",
            };
        }
    }
}
exports.PaynowService = PaynowService;
//# sourceMappingURL=paynow.service.js.map
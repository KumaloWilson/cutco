"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const sendSMS = async (to, body) => {
    try {
        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
            console.error("Twilio configuration is missing.");
            return false;
        }
        const twilioClient = (0, twilio_1.default)(twilioAccountSid, twilioAuthToken);
        const response = await twilioClient.messages.create({
            body: body,
            from: twilioPhoneNumber,
            to: to
        });
        if (response && response.sid) {
            console.log("SMS sent successfully.");
            return true;
        }
        else {
            console.error("SMS failed:", response);
            return false;
        }
    }
    catch (err) {
        console.error("SMS error:", err);
        return false;
    }
};
exports.sendSMS = sendSMS;
//# sourceMappingURL=sms.js.map
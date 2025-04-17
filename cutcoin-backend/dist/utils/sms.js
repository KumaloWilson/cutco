"use strict";
// import axios from "axios"
// import dotenv from "dotenv"
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
// dotenv.config()
// // This is a placeholder for your actual SMS service
// // You'll need to replace this with your preferred SMS provider's API
// export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
//   try {
//     // Example using a generic SMS API
//     // Replace with your actual SMS provider's API
//     const smsApiKey = process.env.SMS_API_KEY
//     const smsApiUrl = process.env.SMS_API_URL
//     if (!smsApiKey || !smsApiUrl) {
//       console.error("SMS API configuration missing")
//       return false
//     }
//     // Example API call - replace with your actual SMS provider's API format
//     const response = await axios.post(smsApiUrl, {
//       apiKey: smsApiKey,
//       to: phoneNumber,
//       message: message,
//       sender: "CUTCOIN",
//     })
//     // Check response based on your SMS provider's API
//     if (response.status === 200 && response.data.success) {
//       return true
//     } else {
//       console.error("SMS sending failed:", response.data)
//       return false
//     }
//   } catch (error) {
//     console.error("Error sending SMS:", error)
//     return false
//   }
// }
const axios_1 = __importDefault(require("axios"));
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
        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const payload = new URLSearchParams({
            To: to,
            From: twilioPhoneNumber,
            Body: body,
        });
        const response = await axios_1.default.post(url, payload, {
            auth: {
                username: twilioAccountSid,
                password: twilioAuthToken,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        if (response.status === 201) {
            console.log("SMS sent successfully.");
            return true;
        }
        else {
            console.error("SMS failed:", response.data);
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
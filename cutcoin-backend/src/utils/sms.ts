import twilio from 'twilio'
import dotenv from 'dotenv'

dotenv.config()

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

export const sendSMS = async (to: string, body: string): Promise<boolean> => {
  try {
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("Twilio configuration is missing.")
      return false
    }
    

    const twilioClient = twilio(twilioAccountSid, twilioAuthToken)

    const response = await twilioClient.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to
    })

    if (response && response.sid) {
      console.log("SMS sent successfully.")
      return true
    } else {
      console.error("SMS failed:", response)
      return false
    }
  } catch (err) {
    console.error("SMS error:", err)
    return false
  }
}
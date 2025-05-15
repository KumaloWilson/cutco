import { Infobip, AuthType } from '@infobip-api/sdk'
import dotenv from 'dotenv'

dotenv.config()

const infobipUrl = process.env.INFOBIP_URL
const infobipKey = process.env.INFOBIP_KEY
const infobipSender = process.env.INFOBIP_SENDER

export const sendSMS = async (to: string, body: string): Promise<boolean> => {
  try {
    if (!infobipUrl || !infobipKey || !infobipSender) {
      console.error("Infobip configuration is missing.")
      return false
    }

    const infobipClient = new Infobip({
      baseUrl: infobipUrl,
      apiKey: infobipKey,
      authType: AuthType.ApiKey,
    })

    const response = await infobipClient.channels.sms.send({
      type: 'text',
      messages: [{
        destinations: [
          {
            to: to,
          },
        ],
        from: infobipSender,
        text: body,
      }],
    })

    if (response && response.messages && response.messages.length > 0) {
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
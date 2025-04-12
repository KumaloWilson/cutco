import axios from "axios"
import crypto from "crypto"
import { SystemConfig } from "../models/system-config.model"
import { HttpException } from "../exceptions/HttpException"

export class PaynowService {
  private integrationId: string
  private integrationKey: string
  private returnUrl: string
  private resultUrl: string
  private paynowUrl: string

  constructor() {
    // These will be loaded from system config in the init method
    this.integrationId = ""
    this.integrationKey = ""
    this.returnUrl = ""
    this.resultUrl = ""
    this.paynowUrl = "https://www.paynow.co.zw/interface/initiatetransaction"
  }

  public async init() {
    try {
      // Load configuration from database
      const configs = await SystemConfig.findAll({
        where: {
          key: ["paynow_integration_id", "paynow_integration_key", "paynow_return_url", "paynow_result_url"],
          isActive: true,
        },
      })

      // Create a map of configs
      const configMap: { [key: string]: string } = {}
      configs.forEach((config) => {
        configMap[config.key] = config.value
      })

      // Set the values
      this.integrationId = configMap["paynow_integration_id"] || ""
      this.integrationKey = configMap["paynow_integration_key"] || ""
      this.returnUrl = configMap["paynow_return_url"] || ""
      this.resultUrl = configMap["paynow_result_url"] || ""

      if (!this.integrationId || !this.integrationKey) {
        throw new Error("Paynow configuration is incomplete")
      }
    } catch (error) {
      console.error("Failed to initialize Paynow service:", error)
      throw new HttpException(500, "Failed to initialize payment service")
    }
  }

  private createHash(values: string): string {
    return crypto.createHash("md5").update(values).digest("hex").toUpperCase()
  }

  private buildQueryString(data: Record<string, string>): string {
    const params = new URLSearchParams()
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, value)
    })
    return params.toString()
  }

  public async createPayment(
    reference: string,
    email: string,
    amount: number,
    description: string,
  ): Promise<{ success: boolean; redirectUrl?: string; error?: string; pollUrl?: string }> {
    try {
      await this.init()

      const data: Record<string, string> = {
        id: this.integrationId,
        reference,
        amount: amount.toString(),
        additionalinfo: description,
        returnurl: this.returnUrl,
        resulturl: this.resultUrl,
        authemail: email,
        status: "Message",
      }

      // Create the hash
      let hashString = ""
      Object.values(data).forEach((value) => {
        hashString += value
      })
      hashString += this.integrationKey

      const hash = this.createHash(hashString)
      data.hash = hash

      // Send request to Paynow
      const response = await axios.post(this.paynowUrl, this.buildQueryString(data), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      // Parse the response
      const responseData: Record<string, string> = {}
      response.data.split("&").forEach((pair: string) => {
        const [key, value] = pair.split("=")
        responseData[key] = value
      })

      if (responseData.status.toLowerCase() === "ok") {
        return {
          success: true,
          redirectUrl: responseData.browserurl,
          pollUrl: responseData.pollurl,
        }
      } else {
        return {
          success: false,
          error: responseData.error || "Payment initialization failed",
        }
      }
    } catch (error) {
      console.error("Paynow payment creation failed:", error)
      return {
        success: false,
        error: "Payment service unavailable",
      }
    }
  }

  public async checkPaymentStatus(
    pollUrl: string,
  ): Promise<{ paid: boolean; status: string; reference?: string; amount?: number }> {
    try {
      const response = await axios.get(pollUrl)

      // Parse the response
      const responseData: Record<string, string> = {}
      response.data.split("&").forEach((pair: string) => {
        const [key, value] = pair.split("=")
        responseData[key] = value
      })

      // Verify the hash
      const originalHash = responseData.hash
      delete responseData.hash

      let hashString = ""
      Object.values(responseData).forEach((value) => {
        hashString += value
      })
      hashString += this.integrationKey

      const calculatedHash = this.createHash(hashString)

      if (calculatedHash !== originalHash) {
        return {
          paid: false,
          status: "hash_mismatch",
        }
      }

      return {
        paid: responseData.status.toLowerCase() === "paid",
        status: responseData.status.toLowerCase(),
        reference: responseData.reference,
        amount: Number.parseFloat(responseData.amount),
      }
    } catch (error) {
      console.error("Paynow status check failed:", error)
      return {
        paid: false,
        status: "error",
      }
    }
  }
}

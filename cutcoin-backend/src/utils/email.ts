import nodemailer from "nodemailer"

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  try {
    // In production, you would use a real email service
    // For development, we can use a test account from Ethereal
    const testAccount = await nodemailer.createTestAccount()

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.ethereal.email",
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || testAccount.user,
        pass: process.env.EMAIL_PASS || testAccount.pass,
      },
    })

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"CUTcoin System" <noreply@cutcoin.com>',
      to,
      subject,
      text,
    })

    console.log(`Email sent: ${info.messageId}`)

    // Log URL for ethereal emails (development only)
    if (process.env.NODE_ENV !== "production") {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    }
  } catch (error) {
    console.error(`Error sending email: ${error}`)
    throw error
  }
}

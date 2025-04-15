import { User } from "../models/user.model"
import { Wallet } from "../models/wallet.model"
import { HttpException } from "../exceptions/HttpException"

export class UserService {
  /**
   * Get user profile by ID
   */
  public async getUserProfile(userId: number) {
    try {
      // Find user with their wallet
      const user = await User.findOne({
        where: { id: userId },
        include: [
          {
            model: Wallet,
            as: "wallet",
            attributes: ["walletAddress", "balance"],
          },
        ],
        attributes: {
          exclude: ["pin", "createdAt", "updatedAt"],
        },
      })

      if (!user) {
        throw new HttpException(404, "User not found")
      }

      return {
        id: user.id,
        studentId: user.studentId,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        kycStatus: user.kycStatus,
        lastLogin: user.lastLogin,
        wallet: user.wallet
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(500, "Error retrieving user profile")
    }
  }

  /**
   * Update user profile
   */
  public async updateUserProfile(userId: number, userData: Partial<User>) {
    try {
      // Find user
      const user = await User.findByPk(userId)

      if (!user) {
        throw new HttpException(404, "User not found")
      }

      // Prevent updating sensitive fields
      delete userData.pin
      delete userData.studentId
      delete userData.kycStatus

      // Update user data
      await user.update(userData)

      return {
        message: "Profile updated successfully",
        user: {
          id: user.id,
          studentId: user.studentId,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email
        },
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(500, "Error updating user profile")
    }
  }
}

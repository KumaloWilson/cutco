import type { Request, Response, NextFunction } from "express"
import { UserService } from "../services/user.service"

export class UserController {
  private userService = new UserService()

  /**
   * Get authenticated user's profile
   */
  public getProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return
      }

      const userId = req.user.id
      const userProfile = await this.userService.getUserProfile(userId)
      res.status(200).json(userProfile)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update authenticated user's profile
   */
  public updateProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const userId = req.user.id
      const userData = req.body
      const result = await this.userService.updateUserProfile(userId, userData)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}

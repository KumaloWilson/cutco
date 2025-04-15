import { Router } from "express"
import { UserController } from "../controllers/user.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import { UpdateProfileDto } from "../dtos/user.dto"

const router = Router()
const userController = new UserController()

// All routes are protected with auth middleware
router.use(authMiddleware)

// Get user profile
router.get("/profile", userController.getProfile)

// Update user profile
router.patch("/profile", validationMiddleware(UpdateProfileDto), userController.updateProfile)

export default router

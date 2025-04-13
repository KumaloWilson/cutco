import { plainToInstance } from "class-transformer"
import { validate, type ValidationError } from "class-validator"
import type { RequestHandler } from "express"
import { HttpException } from "../exceptions/HttpException"

export const validationMiddleware = (
  type: any,
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, _res, next) => {
    const dto = plainToInstance(type, req.body)
    validate(dto, { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints || {})).join(", ")
        next(new HttpException(400, message))
      } else {
        req.body = dto
        next()
      }
    })
  }
}

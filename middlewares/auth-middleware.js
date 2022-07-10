import ApiError from "../exceptions/api-error.js"
import tokenService from "../service/token-service.js"

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return next(ApiError.UnathorizedError())
        }

        const accessToken = authHeader.split(' ')[1]

        if (!accessToken) {
            return next(ApiError.UnathorizedError())
        }

        const userData = tokenService.validateAccessToken(accessToken)

        if (!userData) {
            return next(ApiError.UnathorizedError())
        }

        req.user = userData
        next()
    } catch(e) {
        return next(ApiError.UnathorizedError())
    }
}

export default authMiddleware
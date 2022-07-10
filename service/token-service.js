import jwt from "jsonwebtoken"
import tokenModel from "../models/token-model.js"


class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})

        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) { //валидировать токены
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch(e) {
            return null
        }
    }

    validateRefreshToken(token) { //валидировать токены
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch(e) {
            return null
        }
    }

    async saveToken(id, refreshToken) {
        const tokenData = await tokenModel.findOne({ user: id })

        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return await tokenData.save()
        }

        const token = await tokenModel.create({user: id, refreshToken})
        return token
    }

    async removeToken(refreshToken) {
        const tokenData = tokenModel.deleteOne({refreshToken})
        return tokenData
    }

    async findToken(refreshToken) {
        const token = await tokenModel.findOne({ refreshToken })

        return token
    }
}

export default new TokenService()
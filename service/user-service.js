import userModel from "../models/user-model.js"
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import mailService from "./mail-service.js"
import tokenService from "./token-service.js"
import UserDto from "../dtos/user-dtos.js"
import ApiError from "../exceptions/api-error.js"


class UserService {
    async register(email, password) {
        const candidate = await userModel.findOne({ email })

        if (candidate) {
            throw ApiError.BadRequest('Пользователь с таким email уже существует')
        }

        const activationLink = uuidv4() //рандомная уникальная строка
        const hashPassword = await bcrypt.hash(password, 3)

        const user = await userModel.create({ email, password: hashPassword, activationLink })
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto}) //на вход принимает обычный объект, а не instance of class

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await userModel.findOne({ activationLink })

        if (!user) {
            throw ApiError.BadRequest('Некорректная ссылка активации')
        }

        user.isActivated = true
        await user.save()
    }

    async login(email, password) {
        const user = await userModel.findOne({ email })

        if (!user) {
            throw ApiError.BadRequest("Пользователь не был найден")
        }

        const isPassEquals = await bcrypt.compare(password, user.password)

        if (!isPassEquals) {
            throw ApiError.BadRequest("Неверный пароль")
        }

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnathorizedError()
        }

        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)

        console.log(userData)

        if (!userData || !tokenFromDb) {
            throw ApiError.UnathorizedError()

            return
        }

        const user = await userModel.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await userModel.find()
        return users
    }
}

export default new UserService()
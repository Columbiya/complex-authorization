import { validationResult } from "express-validator"
import ApiError from "../exceptions/api-error.js"
import userService from "../service/user-service.js"


class UserController {
    async register(req, res, next) {
        try {
            const errors = validationResult(req) //возвращается не массив, так что его надо делать errors.array()

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()))
            }

            const {email, password} = req.body
            const userData = await userService.register(email, password)                                            //если https, то нужен флаг secure в значение true
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}) //httpOnly - чтобы нельзя было получать из браузера, с помощью jsa
            return res.json(userData)
        } catch(e) {
            next(e) // Чтобы обработать errorMiddleware
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const userData = await userService.login(email, password)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}) //httpOnly - чтобы нельзя было получать из браузера, с помощью jsa
            return res.json(userData)
        } catch(e) {
            next(e) // Чтобы обработать errorMiddleware
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const token = userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json({message: "Удаление произошло успешно"})
        } catch(e) {
            next(e) // Чтобы обработать errorMiddleware
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link

            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL) //чтобы редиректнуть пользователя на фронтенд
        } catch(e) {
            next(e) // Чтобы обработать errorMiddleware
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}) //httpOnly - чтобы нельзя было получать из браузера, с помощью jsa
            return res.json(userData)
        } catch(e) {
            next(e) // Чтобы обработать errorMiddleware
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers()
            return res.json(users)
        } catch(e) {
            next(e) // Чтобы обработать errorMiddleware
        }
    }
}

//чтобы контроллер не был слишком толстым, выносят некоторую логику в сервисы

export default new UserController()
'use strict'

const version = '1.0'
const Env = use('Env')
const Hash = use('Hash')
const nodemailer = require('nodemailer')
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const moment = require('moment');
const User = use("App/Models/User")
const Token = use("App/Models/Token")
const userx = use("App/Models/VUser")

const transporter = nodemailer.createTransport({
    host: Env.get('SMTP_HOST'),
    port: Env.get('SMTP_PORT'),
    auth: {
        user: Env.get('MAIL_USERNAME'),
        pass: Env.get('MAIL_PASSWORD')
    },
});


class AuthApiController {
    async login ({request, auth, response, view}) {
        var t0 = performance.now()
        const { username, password } = request.all()
        let durasi
        try {
            const token = await auth.authenticator('jwt').newRefreshToken().attempt(username, password)
            const usr = await userx.findBy('username', username)
            durasi = await diagnoticTime.durasi(t0)
            const userToken = await Token.query().where('user_id', usr.id).last()
            
            var uri = request.headers().origin + '/' + userToken.token + '/logout'
            transporter.sendMail({
                from: '"Administrator Alert '+moment().format('YYMMDD HH:mm')+' " <ayat.ekapoetra@gmail.com>', // sender address
                to: `${usr.email}`, // list of receivers
                subject: "MAM SYSTEM Notification ✔", // Subject line
                text: "There is a new article. It's about sending emails, check it out!", // plain text body
                html: view.render("email-login-notification", {
                    date: moment().format('dddd, DD MMMM YYYY'),
                    time: moment().format('HH:mm A') + ' WIB',
                    user: request.headers()['user-agent'],
                    uri: uri
                }),
            }).then(info => {
              console.log({info});
            }).catch(console.error);
            return response.status(201).json({
                diagnostic: {
                    ver: version,
                    times: durasi, 
                    error: false,
                },
                data: token,
                user: usr.toJSON()
            })
        } catch (error) {
            console.log(error);
            durasi = await diagnoticTime.durasi(t0)
            return response.status(404).json({
                diagnostic: {
                    ver: version,
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: null
            })
        }
    }

    async updatePassword ({ request, auth, response }) {
        var t0 = performance.now()
        const req = request.only(['username', 'old_password', 'new_password', 'retype_password'])
        let durasi

        if(req.new_password != req.retype_password){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(400).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'password not match...'
                }
            })
        }

        try {
            const user = await auth.authenticator('jwt').getUser()
            const verifyPassword = await Hash.verify(
                req.old_password,
                user.password
            )
            if (!verifyPassword) {
                durasi = await diagnoticTime.durasi(t0)
                return response.status(400).json({
                    diagnostic: {
                        times: durasi, 
                        error: true,
                        message: 'Current password could not be verified! Please try again.'
                    }
                })
            }
            const usr = await User.findOrFail(user.id)
            usr.password = req.new_password
            await usr.save()
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                    message: 'Password updated!'
                }
            })
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }
    }

    async updatePasswordWithoutOldPassword ({ request, auth, response }) {
        var t0 = performance.now()
        const req = request.only(['user_id', 'new_password', 'retype_password'])
        let durasi;

        if(req.new_password != req.retype_password){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(400).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'password not match...'
                }
            })
        }

        try {
            const usr = await User.findOrFail(req.user_id)
            usr.password = req.new_password
            await usr.save()
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                    message: 'Password updated!'
                }
            })
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }
    }

    async logout ({ auth, response }) {
        try {
            const user = await auth.authenticator('jwt').getUser()
            await Token.query().where('user_id', user.id).delete()
            await auth.logout()
            return response.status(200).json({
                diagnostic: {
                    error: false,
                    message: 'Logout Success...'
                },
                data: {token: null},
            })
            
        } catch (error) {
            console.log(error)
            return response.status(200).json({
                diagnostic: {
                    error: false,
                    message: error
                }
            })
        }
    }
}

module.exports = AuthApiController

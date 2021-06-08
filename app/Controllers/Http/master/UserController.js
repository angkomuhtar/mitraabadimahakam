'use strict'

const Hash = use('Hash')
const Helpers = use('Helpers')
const cryptoRandomString = require('crypto-random-string')

// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Db = use('Database')
const User = use("App/Models/User")
const Profile = use("App/Models/Profile")
const VUser = use("App/Models/VUser")
const Employee = use("App/Models/MasEmployee")

class UserController {
    async index ({auth, view, request, response}) {
        const usr = await auth.getUser()

        new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()

        const existingUser = (await VUser.query().where('status', 'Y').fetch()).toJSON()
        const arrEmail = existingUser.map(el => el.email)
        const employee = await Employee.query().whereNotIn('email', arrEmail).andWhere('aktif', 'Y').fetch()


        // console.log('-'.repeat(92))
        // console.log(' '.repeat(2) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '='.repeat(60))
        // console.log('*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' ' + '#'.repeat(60))
        // console.log(' '.repeat(2) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '='.repeat(60))
        // console.log('*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' ' + '#'.repeat(60))
        // console.log(' '.repeat(2) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '='.repeat(60))
        // console.log('*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' '.repeat(4) + '*' + ' ' + '#'.repeat(60))
        // console.log('='.repeat(92));
        // console.log('#'.repeat(92));
        // console.log('='.repeat(92));
        // console.log('#'.repeat(92));
        // console.log('='.repeat(92));
        // console.log('#'.repeat(92));
        // console.log('='.repeat(92));
        // console.log('#'.repeat(92));
        // console.log('-'.repeat(92))
        


        return view.render('master.user.index', {
            user: employee.toJSON()
        })
    }

    async list ({ auth, request, view }){
        const usr = await auth.getUser()
        const req = request.all()
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let data 
        new Loggerx(request.url(), req, usr, request.method(), true).tempData()
        if(req.keyword != ''){
            data = await VUser.query().where(whe => {
                whe.where('username', 'like', `%${req.keyword}%`)
                whe.orWhere('email', 'like', `%${req.keyword}%`)
                whe.orWhere('phone', 'like', `%${req.keyword}%`)
                whe.orWhere('nm_lengkap', 'like', `%${req.keyword}%`)
            }).andWhere('status', 'Y')
            .paginate(halaman, limit)
        }else{
            data = await VUser.query().where('status', 'Y').paginate(halaman, limit)
        }

        return view.render('master.user.list', {list: data.toJSON()})
    }

    async store ({ auth, request }) {
        const usr = await auth.getUser()

        const req = request.only(['username', 'email', 'nm_depan', 'nm_belakang', 'phone', 'jenkel', 'user_tipe', 'employee_id'])
        const validateAvatar = request.file('avatar', {
            types: ['image'],
            size: '10mb',
            extname: ["jpg", "jpeg", "png"]
        })

        let uriAvatar

        // Validasi Image Avatar
        const avatarUpload = request.file("avatar", validateAvatar)

        // Check avatar exsist
        if(avatarUpload != null){
            const randURL = await cryptoRandomString({length: 30, type: 'url-safe'})
            const aliasName = `${randURL}.${avatarUpload.subtype}`
            uriAvatar = '/avatar/'+aliasName
            await avatarUpload.move(Helpers.publicPath('avatar'), {
                name: aliasName,
                overwrite: true
            })

            // Check image not move to public directory
            if (!avatarUpload.moved()) {
                console.log(avatarUpload.error());
                return avatarUpload.error()
            }
        }

        const addUser = new User()
        addUser.fill({
            username: req.username,
            email: req.email,
            password: 'mam123',
            user_tipe: req.user_tipe
        })

        const trx = await Db.beginTransaction()
        try {
            await addUser.save(trx)

            const profile = new Profile()
            profile.fill({
                user_id: addUser.id,
                nm_depan: req.nm_depan,
                nm_belakang: req.nm_belakang || '',
                phone: req.phone,
                jenkel: req.jenkel,
                avatar: uriAvatar,
                employee_id: req.employee_id
            })
            await profile.save(trx)
            await trx.commit()

            new Loggerx(request.url(), req, usr, request.method(), true).tempData()
            return {
                success: true,
                message: 'Success insert data'
            }
        } catch (error) {
            console.log(error);
            await trx.rollback()
            new Loggerx(request.url(), req, usr, request.method(), error).tempData()
            return {
                success: false,
                message: 'Oops, Failed insert data'
            }
        }
    }

    async show ({auth, params, request, view}) {
        const usr = await auth.getUser()
        const { id } = params
        new Loggerx(request.url(), params, usr, request.method(), true).tempData()
        // await logger.tempData()
        const user = await VUser.findOrFail(id)
        return view.render('master.user.show', {data: user.toJSON()})
    }

    async update ({ auth, params, request }) {
        const usr = await auth.getUser()
        const { id } = params
        const req = request.only(['username', 'user_tipe'])
        const pass = request.only(['password'])

        const logger = new Loggerx(request.url(), {...req, password: pass.password}, usr, request.method(), true)
        await logger.tempData()

        let user = await User.findOrFail(id)
        if(pass.password != null){
            user.merge({...req, password: pass.password})
        }else{
            user.merge(req)
        }

        try {
            await user.save()
            return {
                success: true,
                message: 'Success update data'
            }
        } catch (error) {
            console.log(error);
            const logger = new Loggerx(request.url(), {...req, password: pass.password}, usr, request.method(), error)
            await logger.tempData()
            return {
                success: false,
                message: 'Failed update data'
            }
        }
    }

    async delete ({ auth, params, request }) {
        const usr = await auth.getUser()
        const { id } = params

        new Loggerx(request.url(), params, usr, request.method(), true).tempData()

        let user = await User.findOrFail(id)
        user.status = 'N'

        try {
            await user.save()
            return {
                success: true,
                message: 'Success delete data'
            }
        } catch (error) {
            console.log(error);
            const logger = new Loggerx(request.url(), {...req, password: pass.password}, usr, request.method(), error)
            await logger.tempData()
            return {
                success: false,
                message: 'Failed delete data'
            }
        }
    }
}

module.exports = UserController

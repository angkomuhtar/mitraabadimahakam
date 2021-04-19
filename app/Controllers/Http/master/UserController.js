'use strict'

// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Options = use("App/Models/SysOption")
const VUser = use("App/Models/VUser")
const Employee = use("App/Models/MasEmployee")

class UserController {
    async index ({auth, view, request, response}) {
        const usr = await auth.getUser()

        const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
        await logger.tempData()

        const existingUser = (await VUser.query().where('status', 'Y').fetch()).toJSON()
        const arrEmail = existingUser.map(el => el.email)
        const employee = await Employee.query().whereNotIn('email', arrEmail).andWhere('aktif', 'Y').fetch()
        console.log(employee);
        return view.render('master.user.index', {
            user: employee.toJSON()
        })
    }
}

module.exports = UserController

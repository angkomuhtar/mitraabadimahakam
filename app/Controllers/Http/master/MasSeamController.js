'use strict'
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")
const SeamHelpers = use("App/Controllers/Http/Helpers/Seam")

class MasSeamController {
    async index ({ request, auth, view }) {
        const usr = await auth.getUser()
        new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
        return view.render('master.seam.index')
    }

    async list ({ request, auth, view }) {
        const req = request.all()
        const data = await SeamHelpers.ALL(req)
        return view.render('master.seam.list', {list: data.toJSON()})
    }

    async create ({ auth, view }) {
        try {
            await auth.getUser()
            return view.render('master.seam.create')
        } catch (error) {
            return view.render('401')
        }
    }

    async store ({ request, auth }) {
        const req = request.only(['pit_id', 'kode'])
        req.kode = (req.kode).toUpperCase()
        try {
            await auth.getUser()
            await SeamHelpers.POST(req)
            return {
                success: true,
                message: 'Success save data...'
            }
        } catch (error) {
            return {
                success: false,
                message: 'Failed save data...'
            }
        }
    }

    async show ({ params, auth, view }) {
        try {
            await auth.getUser()
            const data = await SeamHelpers.GET_ID(params)
            return view.render('master.seam.show', {data: data.toJSON()})
        } catch (error) {
            return view.render('401')
        }
    }

    async update ({ params, request, auth }) {
        const req = request.only(['pit_id', 'kode'])
        req.kode = (req.kode).toUpperCase()
        try {
            await auth.getUser()
            await SeamHelpers.UPDATE(params, req)
            return {
                success: true,
                message: 'Success update data...'
            }
        } catch (error) {
            return {
                success: false,
                message: 'Failed update data...'
            }
        }
    }

    async delete ( {params, auth} ) {
        const usr = await auth.getUser()
        if(usr.user_tipe != 'administrator'){
            return {
                success: false,
                message: 'User not authorized....'
            }
        }else{
            try {
                await SeamHelpers.DELETE(params)
                return {
                    success: true,
                    message: 'Success delete data...'
                }
            } catch (error) {
                return {
                    success: false,
                    message: 'Failed delete data...'
                }
            }
        }
    }
}

module.exports = MasSeamController

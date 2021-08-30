'use strict'

const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")
const MaterialHelpers = use("App/Controllers/Http/Helpers/Material")

class MasMaterialController {
    async index ({ request, auth, view }) {
        const usr = await auth.getUser()
        new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
        return view.render('master.material.index')
    }

    async list ({ request, auth, view }) {
        const req = request.all()
        const data = await MaterialHelpers.ALL(req)
        return view.render('master.material.list', {list: data.toJSON()})
    }

    async create ({ auth, view }) {
        try {
            await auth.getUser()
            return view.render('master.material.create')
        } catch (error) {
            return view.render('401')
        }
    }

    async store ({ request, auth }) {
        const req = request.only(['tipe', 'kode', 'name', 'vol'])
        const isVolume = parseFloat(req.vol)

        try {
            await auth.getUser()
            if(isVolume != NaN){
                await MaterialHelpers.POST(req)
                return {
                    success: true,
                    message: 'Success save data...'
                }
            }else{
                return {
                    success: false,
                    message: 'Invalid volume data type...'
                }
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
            const data = await MaterialHelpers.GET_ID(params)
            return view.render('master.material.show', {data: data.toJSON()})
        } catch (error) {
            return view.render('401')
        }
    }

    async update ({ params, request, auth }) {
        const req = request.only(['tipe', 'kode', 'name', 'vol'])
        const isVolume = parseFloat(req.vol)
        try {
            await auth.getUser()
            if(isVolume != NaN){
                await MaterialHelpers.UPDATE(params, req)
                return {
                    success: true,
                    message: 'Success update data...'
                }
            }else{
                await MaterialHelpers.UPDATE(params, req)
                return {
                    success: false,
                    message: 'Invalid volume data type...'
                }
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
                await MaterialHelpers.DELETE(params)
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

module.exports = MasMaterialController

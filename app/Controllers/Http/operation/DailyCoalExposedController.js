'use strict'

const CoalExposedHelpers = use("App/Controllers/Http/Helpers/DailyCoalExposed")

class DailyCoalExposedController {
    async index ({ auth, view }) {
        await auth.getUser()
        return view.render('operation.daily-coal-exposed.index')
    }

    async list ({ auth, request, view }) {
        const req = request.all()
        await auth.getUser()
        const data = await CoalExposedHelpers.ALL(req)
        return view.render('operation.daily-coal-exposed.list', {list: data.toJSON()})
    }

    async filter ({ auth, request, view }) {
        const req = request.all()
        
        await auth.getUser()
        const data = await CoalExposedHelpers.FILTER(req)
        return view.render('operation.daily-coal-exposed.list', {list: data.toJSON()})
    }

    async create ( { auth, view } ) {
        await auth.getUser()
        return view.render('operation.daily-coal-exposed.create')
    }

    async show ( { auth, params, view } ) {
        await auth.getUser()
        const data = await CoalExposedHelpers.GET_ID(params)
        return view.render('operation.daily-coal-exposed.show', {data: data.toJSON()})
    }

    async store ( { auth, request } ) {
        const usr = await auth.getUser()
        const req = request.only(['pit_id', 'tgl', 'volume'])
        req.created_by = usr.id
        try {
            await CoalExposedHelpers.POST(req)
            return {
                success: true,
                message: 'Success save data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed save data...'
            }
        }
    }

    async update ( { auth, params, request } ) {
        const usr = await auth.getUser()
        const req = request.only(['pit_id', 'tgl', 'volume'])
        req.created_by = usr.id
        try {
            await CoalExposedHelpers.UPADTE(params, req)
            return {
                success: true,
                message: 'Success delete data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed delete data...'
            }
        }
    }

    async destroy ( { auth, params } ) {
        await auth.getUser()
        try {
            await CoalExposedHelpers.DELETE(params)
            return {
                success: true,
                message: 'Success delete data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed delete data...'
            }
        }
    }
}

module.exports = DailyCoalExposedController

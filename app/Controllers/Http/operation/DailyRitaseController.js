'use strict'

const DailyRitaseHelpers = use("App/Controllers/Http/Helpers/DailyRitase")

class DailyRitaseController {
    async index ({ view }) {
        return view.render('operation.daily-ritase-ob.index')
    }

    async list ({ request, view }) {
        const req = request.only(['keyword', 'page'])
        try {
            const dailyRitase = (await DailyRitaseHelpers.ALL(req)).toJSON()
            console.log(':::::::', dailyRitase.data);
            return view.render('operation.daily-ritase-ob.list', {list: dailyRitase})
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    async listByPIT ({ params, request, view }) {
        const req = request.only(['page'])
        try {
            const dailyRitase = await DailyRitaseHelpers.BY_PIT(params, req)
            return view.render('operation.daily-ritase-ob.list-by', {
                list: dailyRitase.toJSON(), 
                filtered: 'pit',
                id: params.pit_id
            })
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    async listByFLEET ({ params, request, view }) {
        const req = request.only(['page'])
        try {
            const dailyRitase = await DailyRitaseHelpers.BY_FLEET(params, req)
            
            return view.render('operation.daily-ritase-ob.list-by', {
                list: dailyRitase.toJSON(), 
                filtered: 'fleet',
                id: params.fleet_id
            })
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    async listBySHIFT ({ params, request, view }) {
        const req = request.only(['page'])
        try {
            const dailyRitase = await DailyRitaseHelpers.BY_SHIFT(params, req)
            return view.render('operation.daily-ritase-ob.list-by', {
                list: dailyRitase.toJSON(), 
                filtered: 'shift',
                id: params.shift_id
            })
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }
}

module.exports = DailyRitaseController

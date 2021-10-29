'use strict'

const moment = require("moment")
const DailyRitaseCoalHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoal")
const DailyRitaseCoalDeatilHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoalDetail")

class DailyRitaseCoalController {
    async index ({ view }) {
        return view.render('operation.daily-ritase-coal.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        
        let data = []
        try {
            data = await DailyRitaseCoalDeatilHelpers.ALL(req)
        } catch (error) {
            console.log(error)
        }
        return view.render('operation.daily-ritase-coal.list', {
            limit: req.limit || 100,
            list: data.toJSON()
        })
    }

    async create ({ view }) {

    }

    async show ({ params, view }) {
        console.log(params);
        let data = {}
        try {
            data = await DailyRitaseCoalDeatilHelpers.GET_ID(params)
            console.log(data.toJSON());
        } catch (error) {
            console.log(error)
        }
        return view.render('operation.daily-ritase-coal.show', {data: data.toJSON()})
    }

    async view ({ params, view }) {
        console.log(params);
        let data = {}
        try {
            data = await DailyRitaseCoalDeatilHelpers.GET_ID(params)
            console.log(data.toJSON());
        } catch (error) {
            console.log(error)
        }
        return view.render('operation.daily-ritase-coal.view', {data: data.toJSON()})
    }

    async update ({ auth, params, request }) {
        const req = request.only([
            'checkin_jt', 
            'checkout_jt', 
            'ticket', 
            'stockpile', 
            'coal_tipe',
            'w_gross', 
            'w_tare', 
            'w_netto', 
            'keterangan'
        ])
        const usr = await auth.getUser()
        req.checker_jt = usr.id
        req.stockpile = (req.stockpile).toUpperCase()
        try {
            const data = await DailyRitaseCoalDeatilHelpers.UPDATE(params, req)
            // console.log(data.toJSON());
            return {
                success: true,
                message: 'Ritase Coal success akumulated...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }
}

module.exports = DailyRitaseCoalController

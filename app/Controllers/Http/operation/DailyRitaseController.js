'use strict'

const DailyRitaseHelpers = use("App/Controllers/Http/Helpers/DailyRitase")
const TimeSheet = use("App/Models/DailyChecklist")
const db = use('Database')
const _ = require("underscore")

class DailyRitaseController {
    async index ({ view }) {
        return view.render('operation.daily-ritase-ob.index')
    }

    async list ({ request, view }) {
        const req = request.only(['keyword', 'page'])
        try {
            const dailyRitase = (await DailyRitaseHelpers.ALL(req)).toJSON()
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

    async listUnitByRitase ({ request, view }) {
        const req = request.all()
        // const trx = await db.beginTransaction()
        const dailyRitase = await DailyRitaseHelpers.RITASE_BY_DAILY_ID(req)
        let data = dailyRitase.toJSON()
        const timeSheet = (await TimeSheet.query().with('operator_unit').fetch()).toJSON()
        // const timeSheet = await TimeSheet.query().with('operator_unit').where('dailyfleet_id', item.daily_ritase.dailyfleet_id).andWhere('unit_id', item.hauler_id).first()
        
        for (let [i, item] of data.entries()) {
            const xx = _.find(timeSheet, x => x.dailyfleet_id === item.daily_ritase.dailyfleet_id && x.unit_id === item.hauler_id)
            // console.log('i :::', i);
            if(xx){
                data[i] = {...item, operator: xx.operator_unit.fullname}
                // data.push({operator: xx.operator_unit.fullname})
            }else{
                // console.log('timeSheet :::', 'unset');
                data[i] = {...item, operator: 'not set'}
            }
        }
        console.log('data :::', data);
        return view.render('operation.daily-ritase-ob.show-detais-ritase', {list: data})
    }

    async show ({ params, view }) {
        try {
            const dailyRitase = await DailyRitaseHelpers.ID_SHOW(params)
            return view.render('operation.daily-ritase-ob.show', {
                data: dailyRitase.toJSON()
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

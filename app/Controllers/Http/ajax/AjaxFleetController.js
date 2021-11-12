'use strict'

const _ = require('underscore')
const Fleet = use("App/Models/MasFleet")
const DailyFleet = use("App/Models/DailyFleet")

class AjaxFleetController {
    async getFleets ({ request }) {
        const req = request.all()
        const fleet = (await Fleet.query().where({status: 'Y'}).orderBy('created_at', 'desc').fetch()).toJSON()
        const list = fleet.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})

        return list
    }

    async getFleetsByTipe ({ request }) {
        const req = request.all()
        const fleet = (await Fleet.query().where({status: 'Y', tipe: req.tipe}).orderBy('name', 'desc').fetch()).toJSON()
        const list = fleet.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})

        return list
    }

    async getFleetsByPit ({ request }) {
        const req = request.all()
        const fleet = (
            await Fleet
            .query()
            // .where({status: 'Y', pit_id: req.pit_id})
            .where( w => {
                if(req.tipe){
                    w.where('tipe', req.tipe)
                }
                w.where('pit_id', req.pit_id)
                w.where('status', 'Y')
            })
            .orderBy('name', 'desc')
            .fetch()
        ).toJSON()
        const list = fleet.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})
        // console.log(req);

        return list
    }

    async listDailyFleet ({ request }) {
        const req = request.all()
        try {
            const dailyFleet = (
                await DailyFleet.query()
                    .with('pit')
                    .with('fleet', (builder) => {builder.where('tipe', 'OB')})
                    .with('shift')
                    .where(w => {
                        if(req.date){
                            w.where('date', req.date)
                        }
                        w.where('status', 'Y')
                    })
                    .fetch()
            ).toJSON()

            const data = dailyFleet.map(item => {
                if(item.fleet){
                    return {
                        id: item.id,
                        pit_id: item.pit_id,
                        nm_pit: item.pit.name,
                        nm_fleet: item.fleet.name,
                        tipe_fleet: item.fleet.tipe,
                        nm_shift: item.shift.name,
                        kode_shift: item.shift.kode,
                    }

                }
            })
            const grp = _.groupBy(data.filter(item => item != null), function(val){ return val.nm_pit})
            var result = Object.keys(grp).map(function (key) {    
                return {nm_pit: key, item: grp[key]}
            });
            return result
            
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = AjaxFleetController

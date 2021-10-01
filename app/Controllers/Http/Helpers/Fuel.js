'use strict'

const moment = use("moment")
const MasFuel = use("App/Models/MasFuel")
const MasFuelAgen = use("App/Models/MasFuelAgen")
const MamFuelDist = use("App/Models/MamFuelDist")
const ReFuelUnit = use("App/Models/DailyRefueling")
const timeSheet = use("App/Models/DailyChecklist")
const DailyRefueling = use("App/Models/DailyRefueling");


class Fuels {
    async ALL_FUEL (req) {
        const masFuel = await MasFuel.query().fetch()
        return masFuel
    }

    async FUEL_AGEN (req) {
        const masFuelAgen = await MasFuelAgen.query().fetch()
        return masFuelAgen
    }

    async FUEL_DIST_LIST (req) {
        const limit = 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        let data = []
        console.log('req.keyword::', req.keyword);
        if(req.keyword){
            data = await MamFuelDist
                .query()
                .with('site')
                .with('agen')
                .with('fuel')
                .where(w => {
                    w.where('no_do', 'like', `%${req.keyword}%`)
                    .orWhere('no_so', 'like', `%${req.keyword}%`)
                    .orWhere('no_plat', 'like', `%${req.keyword}%`)
                    .orWhere('seal_top', 'like', `%${req.keyword}%`)
                    .orWhere('seal_bott1', 'like', `%${req.keyword}%`)
                    .orWhere('seal_bott2', 'like', `%${req.keyword}%`)
                    .orWhere('recipient', 'like', `%${req.keyword}%`)
                    .orWhere('mengetahui', 'like', `%${req.keyword}%`)
                    .orWhere('truck_driver', 'like', `%${req.keyword}%`)
                })
                .orderBy('arrival', 'desc')
                .paginate(halaman, limit)
        }else{
            data = await MamFuelDist.query().with('site').with('agen').with('fuel').orderBy('arrival', 'desc').paginate(halaman, limit)
        }

        return data
    }

    async FUEL_DIST_SHOW (params) {
        const data = await MamFuelDist
            .query()
            .with('site')
            .with('agen')
            .with('fuel')
            .where('id', params.id)
            .last()
        return data
    }

    async FUEL_DIST_POST (req) {
        const mamFuelDist = new MamFuelDist()
        mamFuelDist.fill(req)
        await mamFuelDist.save()
        return mamFuelDist
    }

    async FUEL_DIST_UPDATE (params, req) {
        const mamFuelDist = await MamFuelDist.find(params.id)
        mamFuelDist.merge(req)
        await mamFuelDist.save()
        return mamFuelDist
    }

    // OPERATOR REFUEL EQUIPMENT UNIT

    async LIST_REFUEL_UNIT (req) {
        const limit = 100
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        let data = []
        if(req.keyword){
            data = await DailyRefueling
                .query()
                .with('timesheet', ts => {
                    ts.with('dailyFleet', df => {
                        df.with('pit')
                        df.with('fleet')
                    })
                })
                .with('equipment')
                .with('truck_fuel')
                .with('user')
                .with('operator_unit')
                .orderBy('fueling_at', 'desc')
                .paginate(halaman, limit)
        }else{
            data = await DailyRefueling.query()
                .with('timesheet', ts => {
                    ts.with('dailyFleet', df => {
                        df.with('pit')
                        df.with('fleet')
                    })
                })
                .with('equipment')
                .with('truck_fuel')
                .with('user')
                .with('operator_unit')
                .orderBy('fueling_at', 'desc').paginate(halaman, limit)
        }

        // console.log(JSON.stringify(data.toJSON(), null, 4));
        return data
    }

    // POST DATA REFUEL UNIT BY DASHBOARD
    async POST_REFUEL_UNIT (req) {
        const refuelunit = new ReFuelUnit()
        const timesheet = await timeSheet.query()
            .where('unit_id', req.equip_id)
            .andWhere('approved_at', 'like', `${moment(req.fueling_at).format('YYYY-MM-DD')}%`)
            .last()
        refuelunit.fill({...req, timesheet_id: timesheet ? timesheet.id : null})
        // console.log('TIMESHEET :::', refuelunit.toJSON());
        await refuelunit.save()
        return refuelunit
    }

    // POST DATA REFUEL UNIT BY DASHBOARD
    async UPDATE_REFUEL_UNIT (params, req) {
        const refuelunit = await ReFuelUnit.query().where('id', params.id).last()
        const timesheet = await timeSheet.query()
            .where('unit_id', req.equip_id)
            .andWhere('approved_at', 'like', `${moment(req.fueling_at).format('YYYY-MM-DD')}%`)
            .last()
        refuelunit.merge({...req, timesheet_id: timesheet ? timesheet.id : null})
        await refuelunit.save()
        return refuelunit
    }
}

module.exports = new Fuels()
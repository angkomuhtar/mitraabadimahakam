'use strict'

const DailyRitaseCoal = use("App/Models/DailyRitaseCoal")
const DailyRitaseCoalDetail = use("App/Models/DailyRitaseCoalDetail")

class RitaseCoal {
    async ALL (req) { 
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let dailyRitase
        if(req.keyword){
            dailyRitase = await DailyRitaseCoal
                .query()
                .with('checker')
                .with('shift')
                .with('daily_fleet', details => {
                    details.with('details', unit => unit.with('equipment'))
                    details.with('activities')
                    details.with('fleet')
                    details.with('pit')
                })
                .andWhere("status", "Y")
                .orderBy('created_at', 'desc')
                .paginate(halaman, limit)
        }else{
            dailyRitase = await DailyRitaseCoal
                .query()
                .with('checker')
                .with('shift')
                .with('daily_fleet', details => {
                    details.with('details', unit => unit.with('equipment'))
                    details.with('activities')
                    details.with('fleet')
                    details.with('pit')
                })
                .where("status", "Y")
                .orderBy('created_at', 'desc')
                .paginate(halaman, limit)
        }

        return dailyRitase
    }

    async GET_ID (params) {
        const dailyRitase = await DailyRitaseCoal
            .query()
            .with('checker')
            .with('shift')
            .with('daily_fleet', details => {
                details.with('details', unit => unit.with('equipment'))
                details.with('activities')
                details.with('fleet')
                details.with('pit')
            })
            .andWhere({status: "Y", id: params.id})
            .first()
        return dailyRitase
    }

    async POST (req) {
        try {
            const ritaseCoal = new DailyRitaseCoal()
            ritaseCoal.fill(req)
            await ritaseCoal.save()
            return ritaseCoal
        } catch (error) {
            return error
        }
    }
}

module.exports = new RitaseCoal()
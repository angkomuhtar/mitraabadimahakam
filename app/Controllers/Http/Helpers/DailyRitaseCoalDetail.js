'use strict'

const DailyRitaseCoal = use("App/Models/DailyRitaseCoal")
const DailyRitaseCoalDetail = use("App/Models/DailyRitaseCoalDetail")

class RitaseCoalDetail {
    async ALL (req) { 
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let dailyRitaseCoalDetail
        if(req.keyword){
            dailyRitaseCoalDetail = await DailyRitaseCoalDetail
                .query()
                .with('ritase_coal', a => {
                    a.with('daily_fleet', aa => aa.with('pit'))
                    a.with('shift')
                    a.with('checker')
                })
                .with('seam')
                .with('transporter')
                .with('opr')
                .with('checkerJT')
                .where(w => w.where('kupon', 'like', `%${req.keyword}%`).orWhere('ticket', 'like', `%${req.keyword}%`))
                .orderBy('created_at', 'desc')
                .paginate(halaman, limit)
        }else{
            dailyRitaseCoalDetail = await DailyRitaseCoalDetail
                .query()
                .with('ritase_coal', a => {
                    a.with('daily_fleet', aa => aa.with('pit'))
                    a.with('shift')
                    a.with('checker')
                })
                .with('seam')
                .with('transporter')
                .with('opr')
                .with('checkerJT')
                .orderBy('created_at', 'desc')
                .paginate(halaman, limit)
        }

        return dailyRitaseCoalDetail
    }

    async GET_ID (params) {
        const dailyRitaseCoalDetail = await DailyRitaseCoalDetail
            .query()
            .with('ritase_coal', a => {
                a.with('daily_fleet', aa => aa.with('pit'))
                a.with('shift')
                a.with('checker')
            })
            .with('seam')
            .with('transporter')
            .with('opr')
            .with('checkerJT')
            .where('id', params.id)
            .orderBy('created_at', 'desc')
            .first()
        return dailyRitaseCoalDetail
    }

    async POST (req) {
        const validTiket = await DailyRitaseCoalDetail.query().where({kupon: req.kupon}).first()
        if(validTiket){
            throw new Error('Duplicate kupon number...')
        }

        const validID = await DailyRitaseCoal.query().where({id: req.ritasecoal_id}).first()
        if(!validID){
            throw new Error('Invalid ID Ritase Coal...')
        }

        try {
            const dailyRitaseCoalDetail = new DailyRitaseCoalDetail()
            dailyRitaseCoalDetail.fill(req)
            await dailyRitaseCoalDetail.save()
            return dailyRitaseCoalDetail
        } catch (error) {
            return error
        }
    }

    async UPDATE (params, req) {
        console.log(params);
        try {
            const ritaseCoalDetail = await DailyRitaseCoalDetail.find(params.id)
            ritaseCoalDetail.merge(req)
            await ritaseCoalDetail.save()
            return ritaseCoalDetail
        } catch (error) {
            return error
        }
    }

    async DELETE (params) {
        try {
            const dailyRitaseCoalDetail = await DailyRitaseCoalDetail.find(params.id)
            await dailyRitaseCoalDetail.delete()
            return dailyRitaseCoalDetail
        } catch (error) {
            return error
        }
    }
}

module.exports = new RitaseCoalDetail()
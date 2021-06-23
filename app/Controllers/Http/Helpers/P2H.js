'use strict'
const db = use('Database')
const MasP2H = use("App/Models/MasP2H")
const DailyCheckp2H = use("App/Models/DailyCheckp2H")


class P2H {
    async ALL (req) {
        let masP2H
        if(req.keyword){
            masP2H = 
                await MasP2H
                .query()
                .where('task', 'like', `%${req.keyword}%`)
                .andWare('sts', 'Y')
                .fetch()
        }else{
            masP2H = await MasP2H.query().where({sts: 'Y'}).fetch()
        }
        
        return masP2H
    }

    async WITH_TIMESHEET_ID (req) {
        const trx = await db.beginTransaction()
        try {
            const masP2H = (await MasP2H.query(trx).where({sts: 'Y'}).fetch()).toJSON()
            let result = []
            for (const item of masP2H) {
                const dailyp2h = await DailyCheckp2H.query(trx).where('checklist_id', req.id).andWhere('p2h_id', item.id).first()
                if(dailyp2h){
                    result.push({...item, p2h_id: item.id, is_check: dailyp2h.is_check, description: dailyp2h.description})
                }else{
                    result.push({...item, p2h_id: item.id, is_check: 'Y', description: ''})
                }
            }
            console.log(result);
            return result
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new P2H()
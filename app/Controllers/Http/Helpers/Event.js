'use strict'

const MasEvent = use("App/Models/MasEvent")


class Events {
    async ALL (req) {
        let masEvent
        if(req.keyword){
            masEvent = 
                await MasEvent
                .query()
                .where('narasi', 'like', `%${req.keyword}%`)
                .andWare('aktif', 'Y')
                .fetch()
        }else{
            masEvent = await MasEvent.query().where({aktif: 'Y'}).fetch()
        }
        
        return masEvent
    }

    // async WITH_TIMESHEET_ID (req) {
    //     const masP2H = (await MasEvent.query().where({sts: 'Y'}).fetch()).toJSON()
    //     let result = []
    //     for (const item of masP2H) {
    //         const dailyp2h = await DailyCheckp2H.query().where({checklist_id: req.id, p2h_id: item.id}).first()
    //         if(dailyp2h){
    //             result.push({...item, is_check: dailyp2h.is_check, description: dailyp2h.description})
    //         }else{
    //             result.push({...item, is_check: 'Y', description: ''})
    //         }
    //     }
    //     return result
    // }
}

module.exports = new Events()
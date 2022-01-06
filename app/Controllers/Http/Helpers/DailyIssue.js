'use strict'

const Issue = use("App/Models/MamIssue")

class dailyIssue {
    async ALL (req) {
        const limit = parseInt(req.limit) || 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let data
        if (req.keyword) {
            data = await Issue.query()
            .with('user')
            .with('dailyevent', w => w.with('event'))
            .with('unit')
            .where( w => {
                if(req.event_id){
                    w.where('event_id', req.event_id)
                }
                if (req.issue) {
                    w.where('issue', 'like', `%${req.issue}%`)
                }
                if(req.unit_id){
                    w.whereIn('unit_id', req.unit_id)
                }
            })
            .orderBy('report_at', 'desc')
            .paginate(halaman, limit)
            
        } else {
            data = await Issue.query().with('user').with('dailyevent', w => w.with('event')).with('unit').orderBy('report_at', 'desc').paginate(halaman, limit)
        }
        console.log(data.toJSON());
        return data
    }
    
    async POST (req, user) { 
        try {
            const issue = new Issue()
            issue.fill(req)
            await issue.save()
            return {
                success: true,
                message: 'Success save data...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed save data...'+JSON.stringify(error)
            }
        }
    }

    async SHOW (params) {
        const data =( 
            await Issue.query()
            .with('user')
            .with('dailyevent', w => w.with('event'))
            .with('unit')
            .where('id', params.id)
            .last()
        ).toJSON()
        // data.arrUnit = data.unit.map(el => el.id)
        console.log(data);
        return data
    }

    // async DELETE(params){
    //     const eventTimeSheet = await EventTimeSheet.find(params.dailyEventID)
    //     if(eventTimeSheet){
    //         await eventTimeSheet.delete()
    //         return eventTimeSheet
    //     }else{
    //         throw new Error('Data daily event ID ::'+params.dailyEventID+' not found...')
    //     }
    // }
}

module.exports = new dailyIssue()

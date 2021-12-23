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
            .with('event')
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
            .paginate(halaman, limit)
            
        } else {
            data = await Issue.query().with('user').with('event').with('unit').paginate(halaman, limit)
        }
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

    async DELETE(params){
        const eventTimeSheet = await EventTimeSheet.find(params.dailyEventID)
        if(eventTimeSheet){
            await eventTimeSheet.delete()
            return eventTimeSheet
        }else{
            throw new Error('Data daily event ID ::'+params.dailyEventID+' not found...')
        }
    }
}

module.exports = new dailyIssue()

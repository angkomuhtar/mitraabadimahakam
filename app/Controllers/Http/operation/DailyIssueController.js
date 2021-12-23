'use strict'

const DB = use('Database')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require('moment')
const TimeSheet = use("App/Models/DailyChecklist")
const DailyEvent = use("App/Models/DailyEvent")
const MamIssue = use("App/Models/MamIssue")
// const EventHelpers = use("App/Controllers/Http/Helpers/DailyEvent")
const IssueHelpers = use("App/Controllers/Http/Helpers/DailyIssue")

class DailyIssueController {
    async index ( { auth, view } ) {
        console.log('XXXX');
        return view.render('operation.daily-issue.index')
    }

    async list ( { request, view } ) {
        const req = request.all()
        const data = await IssueHelpers.ALL(req)
        console.log(data.toJSON());
        return view.render('operation.daily-issue.list', {list: data.toJSON()})
    }

    async create ( { request, view } ) {
        const req = request.all()
        return view.render('operation.daily-issue.create')
    }

    async store ( { auth, request } ) {
        let user = await auth.getUser()
        const req = request.except(['csrf_token', '_csrf', 'submit'])

        req.equip_id = _.isArray(req.equip_id) || [req.equip_id]
        
        console.log(req);

        for (const unit of req.equip_id) {

            const timeSheet = await TimeSheet.query().where( w => {
                w.where('unit_id', unit)
                w.where('approved_at', req.start_at)
            }).last()
            let timesheet_id = timeSheet?.id || null

            if(req.event_id){
                try {
                    const dailyEvent = new DailyEvent()
                    dailyEvent.fill({
                        timesheet_id: timesheet_id,
                        event_id: req.event_id,
                        user_id: user.id,
                        equip_id: unit,
                        description: req.description,
                        start_at: req.start_at,
                        end_at: req.end_at || null
                    })

                    await dailyEvent.save()
                } catch (error) {
                    console.log(error);
                    return {
                        success: false,
                        message: 'Failed save data event...'+JSON.stringify(error)
                    }
                }

                try {
                    const mamIssue = new MamIssue()
                    mamIssue.fill({
                        unit_id: unit,
                        event_id: req.event_id,
                        report_by: user.id,
                        report_at: req.start_at,
                        issue: req.description
                    })
                    await mamIssue.save()
                } catch (error) {
                    console.log(error);
                    return {
                        success: false,
                        message: 'Failed save data issue...'+JSON.stringify(error)
                    }
                }
                
            }else{
                try {
                    const mamIssuex = new MamIssue()
                    mamIssuex.fill({
                        unit_id: unit,
                        event_id: req.event_id,
                        report_by: user.id,
                        report_at: req.start_at,
                        issue: req.description
                    })
                    await mamIssuex.save()
                } catch (error) {
                    console.log(error);
                    return {
                        success: false,
                        message: 'Failed save data issue...'+JSON.stringify(error)
                    }
                }

            }

            return {
                success: true,
                message: 'Success save data...'
            }
        }
    }
}

module.exports = DailyIssueController

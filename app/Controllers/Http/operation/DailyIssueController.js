'use strict'

const DB = use('Database')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require('moment')
const TimeSheet = use("App/Models/DailyChecklist")
const DailyEvent = use("App/Models/DailyEvent")
const MamIssue = use("App/Models/MamIssue")
const EventHelpers = use("App/Controllers/Http/Helpers/DailyEvent")
const IssueHelpers = use("App/Controllers/Http/Helpers/DailyIssue")

class DailyIssueController {
    async index ( { auth, view } ) {
        console.log('XXXX');
        return view.render('operation.daily-issue.index')
    }

    async list ( { request, view } ) {
        const req = request.all()
        const data = await IssueHelpers.ALL(req)
        return view.render('operation.daily-issue.list', {list: data.toJSON()})
    }

    async create ( { request, view } ) {
        const req = request.all()
        return view.render('operation.daily-issue.create')
    }

    async store ( { auth, request } ) {
        let user = await auth.getUser()
        const req = request.except(['csrf_token', '_csrf', 'submit'])

        req.equip_id = _.isArray(req.equip_id) ? req.equip_id : [req.equip_id]
        console.log(req.equip_id);

        for (const unit of req.equip_id) {

            const timeSheet = await TimeSheet.query().where( w => {
                w.where('unit_id', unit)
                w.where('approved_at', req.start_at)
            }).last()
            let timesheet_id = timeSheet?.id || null

            let dataEvent = {
                timesheet_id: timesheet_id,
                event_id: req.event_id,
                user_id: user.id,
                equip_id: unit,
                description: req.description,
                start_at: req.start_at,
                end_at: req.end_at || null
            }

            let dataIssue = {
                unit_id: unit,
                event_id: req.event_id,
                report_by: user.id,
                report_at: req.start_at,
                end_at: req.end_at || null,
                issue: req.description
            }
            console.log(dataEvent);
            console.log(dataIssue);
            const dailyEvent = new DailyEvent()
            const mamIssue = new MamIssue()
            if(req.event_id){
                try {
                    dailyEvent.fill(dataEvent)
                    await dailyEvent.save()
                    mamIssue.fill(dataIssue)
                    await mamIssue.save()
                    return {
                        success: true,
                        message: 'Success save data...'
                    }
                } catch (error) {
                    console.log(error);
                    return {
                        success: false,
                        message: 'Failed save data issue...'+JSON.stringify(error)
                    }
                }
            }else{
                try {
                    mamIssue.fill(dataIssue)
                    await mamIssue.save()
                    return {
                        success: true,
                        message: 'Success save data...'
                    }
                } catch (error) {
                    console.log(error);
                    return {
                        success: false,
                        message: 'Failed save data issue...'+JSON.stringify(error)
                    }
                }
            }
        }
    }

    async show ( { auth, params, view } ) {
        await auth.getUser()

        const data = await IssueHelpers.SHOW(params)
        console.log(data);
        return view.render('operation.daily-issue.show', {data: data})
    }

    async update ( { auth, params, request, view } ) {
        const req = request.all()
        console.log(params);
        console.log(req);
        if(req.event_id){
            // const 
        }
    }
}

module.exports = DailyIssueController

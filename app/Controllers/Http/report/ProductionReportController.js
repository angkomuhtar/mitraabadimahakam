'use strict'

const moment = require("moment")
const MasPit = use("App/Models/MasPit")
const MasShift = use("App/Models/MasShift")
const ReportOBHelpers = use("App/Controllers/Http/Helpers/ReportOB")

class ProductionReportController {

    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        return view.render('report.ob.index')
    }

    async dataGraphOB ( { request } ) {
        const req = request.all()
        console.log(req);
        let pit
        let shift
        if(req.pit_id){
            pit = await MasPit.query().where('id', req.pit_id).last()
        }
        if(req.shift_id){
            shift = await MasShift.query().where('id', req.shift_id).last()
        }

        const data = await ReportOBHelpers.SHOW(req)
        // console.log('XXXXX', JSON.stringify(data, null, 2));
        
        return {
            success: true,
            chartType: req.graphType,
            filterType: req.filterType,
            data: data,
            pit: pit?.name || 'ALL PIT LOCATIONS',
            shift: shift?.name || 'ALL SHIFT SCHEDULES',
            periode: {
                start: req.start_date || moment().startOf('month').format('YYYY-MM-DD'),
                end: req.end_date || moment().format('YYYY-MM-DD')
            }
        }
    }

    async viewGraphOB ( { auth, view, request } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        // const data = await ReportOBHelpers.SHOW(req)
        return view.render('report.ob.graph-content')
    }

    async viewTableOB ( { auth, view, request } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await ReportOBHelpers.SHOW(req)
        return view.render('report.ob.table', {list: data})
    }
}

module.exports = ProductionReportController

async function userValidate(auth){
    let user
    try {
        user = await auth.getUser()
        return user
    } catch (error) {
        console.log(error);
        return null
    }
}
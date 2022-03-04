'use strict'

const moment = require("moment")
const MasPit = use("App/Models/MasPit")
const MasShift = use("App/Models/MasShift")
const ReportOBHelpers = use("App/Controllers/Http/Helpers/ReportOB")
const ReportPoductionHelpers = use("App/Controllers/Http/Helpers/ReportPoduction")

class ProductionReportController {

    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        // return view.render('report.ob.index')
        return view.render('report.production.index')
    }

    async filterForm ( { view } ) {
        return view.render('report.production.filter')
    }

    async applyFilter ( { request } ) {
        const req = request.all()
        if(req.production_type === 'OB'){

            if(req.range_type === 'MW'){
                const pit = await MasPit.query().where('id', req.pit_id).last()
                const monthlyWise = await MONTHLY_WISE(req)
                return {
                    success: true,
                    chartType: req.graphType,
                    filterType: req.filterType,
                    data: monthlyWise,
                    pit: pit?.name || 'ALL PIT LOCATIONS',
                    group: 'MW',
                    periode: {
                        start: req.start_date || moment().startOf('month').format('YYYY-MM-DD'),
                        end: req.end_date || moment().format('YYYY-MM-DD')
                    }
                }
            }

            if(req.range_type === 'PW'){
                const periodWise = await PERIODE_WISE(req)
                return {
                    data: periodWise.data,
                    x_Axis: periodWise.xAxis,
                    group: 'PW',
                }
            }

        }else{
            if(req.range_type === 'MW'){
                const monthlyWise_bb = await BB_MONTHLY_WISE(req)
                return {
                    data: monthlyWise_bb.data,
                    x_Axis: monthlyWise_bb.xAxis,
                    group: 'MW',
                }
            }

            if(req.range_type === 'PW'){
                const periodWise_bb = await BB_PERIODE_WISE(req)
                return {
                    data: periodWise_bb.data,
                    x_Axis: periodWise_bb.xAxis,
                    group: 'PW',
                }
            }
        }
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

async function MONTHLY_WISE(req){
    if(req.filterType === 'MONTHLY'){
        const data = await ReportPoductionHelpers.MW_MONTHLY(req)
        return data
    }

    if(req.filterType === 'WEEKLY'){
        const data = await ReportPoductionHelpers.MW_WEEKLY(req)
        return data
    }

    if(req.filterType === 'DATE'){
        const data = await ReportPoductionHelpers.MW_DAILY(req)
        return data
    }

    if(req.filterType === 'SHIFT'){
        const data = await ReportPoductionHelpers.MW_SHIFTLY(req)
        return data
    }

    if(req.filterType === 'HOURLY'){
        const data = await ReportPoductionHelpers.MW_HOURLY(req)
        return data
    }
}
async function PERIODE_WISE(req){
    if(req.filterType === 'MONTHLY'){
        const data = await ReportPoductionHelpers.PW_MONTHLY(req)
        return data
    }

    if(req.filterType === 'WEEKLY'){
        const data = await ReportPoductionHelpers.PW_WEEKLY(req)
        return data
    }

    if(req.filterType === 'DATE'){
        const data = await ReportPoductionHelpers.PW_DAILY(req)
        return data
    }

    if(req.filterType === 'SHIFT'){
        const data = await ReportPoductionHelpers.PW_SHIFTLY(req)
        return data
    }

    if(req.filterType === 'HOURLY'){
        const data = await ReportPoductionHelpers.PW_HOURLY(req)
        return data
    }
}
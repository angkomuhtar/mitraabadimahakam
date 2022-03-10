'use strict'

const moment = require("moment")
const MasPit = use("App/Models/MasPit")
const MasShift = use("App/Models/MasShift")
const ReportOBHelpers = use("App/Controllers/Http/Helpers/ReportOB")
const ReportPoductionHelpers = use("App/Controllers/Http/Helpers/ReportPoduction")
const ReportPDFHelpers = use("App/Controllers/Http/Helpers/ReportPDF")

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
        console.log('====================================');
        console.log(req);
        console.log('====================================');
        if(req.range_type === 'MW'){
            const monthlyWise = await MONTHLY_WISE(req)
            return {
                data: monthlyWise.data,
                x_Axis: monthlyWise.xAxis,
                group: 'MW',
            }
        }

        if(req.range_type === 'PW'){
            const periodWise = await PERIODE_WISE(req)
            return {
                site: periodWise.site_nm || 'BBE',
                data: periodWise.data,
                x_Axis: periodWise.xAxis,
                group: 'PW',
            }
        }
    }

    async showData ( { request } ) {
        let req = request.all()
        console.log('QUERY STRING :::', req);
        if(req.production_type === 'OB'){
            const dataOB = await GEN_PDF_OB (req)
            return dataOB
        }else{
            const dataCOAL = await GEN_PDF_COAL (req)
            return dataCOAL
        }
    }

    // async dataGraphOB ( { request } ) {
    //     const req = request.all()
    //     console.log(req);
    //     let pit
    //     let shift
    //     if(req.pit_id){
    //         pit = await MasPit.query().where('id', req.pit_id).last()
    //     }
    //     if(req.shift_id){
    //         shift = await MasShift.query().where('id', req.shift_id).last()
    //     }

    //     const data = await ReportOBHelpers.SHOW(req)
    //     // console.log('XXXXX', JSON.stringify(data, null, 2));
        
    //     return {
    //         success: true,
    //         chartType: req.graphType,
    //         filterType: req.filterType,
    //         data: data,
    //         pit: pit?.name || 'ALL PIT LOCATIONS',
    //         shift: shift?.name || 'ALL SHIFT SCHEDULES',
    //         periode: {
    //             start: req.start_date || moment().startOf('month').format('YYYY-MM-DD'),
    //             end: req.end_date || moment().format('YYYY-MM-DD')
    //         }
    //     }
    // }

    // async viewGraphOB ( { auth, view, request } ) {
    //     const req = request.all()
    //     const user = await userValidate(auth)
    //     if(!user){
    //         return view.render('401')
    //     }
    //     // const data = await ReportOBHelpers.SHOW(req)
    //     return view.render('report.ob.graph-content')
    // }

    // async viewTableOB ( { auth, view, request } ) {
    //     const req = request.all()
    //     const user = await userValidate(auth)
    //     if(!user){
    //         return view.render('401')
    //     }
    //     const data = await ReportOBHelpers.SHOW(req)
    //     return view.render('report.ob.table', {list: data})
    // }
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

/** CHART DATA VIEW **/
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

/** DETAILS DATA DOWNLOAD **/
async function GEN_PDF_OB (req) {
    if(req.filterType === 'MONTHLY'){
        const data = await ReportPDFHelpers.MONTHLY_OB_PDF(req)
        return data
    }

    if(req.filterType === 'WEEKLY'){
        const data = await ReportPDFHelpers.WEEKLY_OB_PDF(req)
        return data
    }

    if(req.filterType === 'DATE'){
        const data = await ReportPDFHelpers.DAILY_OB_PDF(req)
        return data
    }

    if(req.filterType === 'SHIFT'){
        const data = await ReportPDFHelpers.SHIFTLY_OB_PDF(req)
        return data
    }

    if(req.filterType === 'HOURLY'){
        const data = await ReportPDFHelpers.HOURLY_OB_PDF(req)
        return data
    }
}

async function GEN_PDF_COAL (req) {
    if(req.filterType === 'MONTHLY'){
        const data = await ReportPDFHelpers.MONTHLY_COAL_PDF(req)
        return data
    }

    if(req.filterType === 'WEEKLY'){
        const data = await ReportPDFHelpers.WEEKLY_COAL_PDF(req)
        return data
    }

    if(req.filterType === 'DATE'){
        const data = await ReportPDFHelpers.DAILY_COAL_PDF(req)
        return data
    }

    if(req.filterType === 'SHIFT'){
        const data = await ReportPDFHelpers.SHIFTLY_COAL_PDF(req)
        return data
    }

    if(req.filterType === 'HOURLY'){
        const data = await ReportPDFHelpers.HOURLY_COAL_PDF(req)
        return data
    }
}
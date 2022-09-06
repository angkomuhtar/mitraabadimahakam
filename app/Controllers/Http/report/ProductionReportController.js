'use strict'

// const si = require('systeminformation');
const Helpers = use('Helpers')
const moment = require("moment")
const MasSite = use("App/Models/MasSite")
const MasPit = use("App/Models/MasPit")
const MasShift = use("App/Models/MasShift")
const ReportOBHelpers = use("App/Controllers/Http/Helpers/ReportOB")
const ReportPoductionHelpers = use("App/Controllers/Http/Helpers/ReportPoduction")
const ReportPDFHelpers = use("App/Controllers/Http/Helpers/ReportPDF")
const ReportXLSHelpers = use("App/Controllers/Http/Helpers/ReportXLS")

class ProductionReportController {

    async index ( { auth, view } ) {
        
        const user = await userValidate(auth)

        if(!user){
            return view.render('401')
        }
        return view.render('report.production.index')
    }

    async filterForm ( { view } ) {
        return view.render('report.production.filter')
    }

    async applyFilter ( { request } ) {
        const req = request.all()
        console.log('REQUEST ::::', req);

        let site = null
        let pit = null
        if(req.site_id){
            site = (await MasSite.query().where('id', req.site_id).last()).toJSON()
        }
        if(req.pit_id){
            pit = (await MasPit.query().where('id', req.pit_id).last()).toJSON()
        }


        if(req.range_type === 'MW'){
            const monthlyWise = await MONTHLY_WISE(req)
            return {
                site: site,
                pit: pit,
                data: monthlyWise.data,
                x_Axis: monthlyWise.xAxis,
                group: 'MW',
            }
        }

        if(req.range_type === 'PW'){
            const periodWise = await PERIODE_WISE(req)
            return {
                site: site,
                pit: pit,
                data: periodWise.data,
                x_Axis: periodWise.xAxis,
                group: 'PW',
            }
        }
    }

    async genDataPDF ( { request } ) {
        let req = request.all()
        console.log('QUERY STRING :::', req);

        const attchment = request.file('chartImg')

        if(attchment){
            const randURL = moment().format('YYYYMMDDHHmm')
            const aliasName = `chart-${req.production_type}-${req.range_type}-${req.filterType}-${randURL}.png`
            var grafikPath = '/upload/'+aliasName

            await attchment.move(Helpers.publicPath(`upload`), {
                name: aliasName,
                overwrite: true,
            })
            if (!attchment.moved()) {
                console.log(attchment.error());
                return 'gagal simpan gambar....'
            }
            
        }

        if(req.production_type === 'OB'){
            const dataOB = await GEN_PDF_OB (req, grafikPath)
            return dataOB
        }else{
            const dataCOAL = await GEN_PDF_COAL (req, grafikPath)
            return dataCOAL
        }
    }

    async genDataXLS ( { request } ) {
        let req = request.all()
        const data = await GEN_XLS (req)
        return data
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
        req.start_date = req.start_hours
        req.end_date = req.end_hours
        
        var a = moment(req.end_hours)
        var b = moment(req.start_hours)
        var duration = a.diff(b, 'hours')

        let arrHours = []
        for (let i = 0; i <= duration; i++) {
            arrHours.push(moment(req.start_hours).startOf('h').add(i, 'h').format('HH:[00]'))
        }

        let result = []
        let data = await ReportPoductionHelpers.PW_HOURLY(req)
        for (const obj of data.data) {
            let details = []
            for (const val of obj.items) {
                if(arrHours.includes(val.pukul)){
                    details.push(val)
                }
            }

            result.push({
                ...obj,
                items: details
            })
        }
        data.data = result
        data.xAxis = arrHours
        return data
    }
}

/** DETAILS DATA DOWNLOAD **/
async function GEN_PDF_OB (req, img) {
    if(req.filterType === 'MONTHLY'){
        const data = await ReportPDFHelpers.MONTHLY_OB_PDF(req, img)
        return data
    }

    if(req.filterType === 'WEEKLY'){
        const data = await ReportPDFHelpers.WEEKLY_OB_PDF(req, img)
        return data
    }

    if(req.filterType === 'DATE'){
        const data = await ReportPDFHelpers.DAILY_OB_PDF(req, img)
        return data
    }

    if(req.filterType === 'SHIFT'){
        const data = await ReportPDFHelpers.SHIFTLY_OB_PDF(req, img)
        return data
    }

    if(req.filterType === 'HOURLY'){

        req.start_date = req.start_hours
        req.end_date = req.end_hours
        req.pit_id = req.pit_id != 'undefined' ? req.pit_id : null
        req.group = req.pit_id ? req.pit_id : null
        req.date = req.date != 'undefined' ? req.date : null

        const data = await ReportPDFHelpers.HOURLY_OB_PDF(req, img)
        
        return data
    }
}

async function GEN_PDF_COAL (req, grafikPath) {
    if(req.filterType === 'MONTHLY'){
        const data = await ReportPDFHelpers.MONTHLY_COAL_PDF(req, grafikPath)
        return data
    }

    if(req.filterType === 'WEEKLY'){
        const data = await ReportPDFHelpers.WEEKLY_COAL_PDF(req, grafikPath)
        return data
    }

    if(req.filterType === 'DATE'){
        const data = await ReportPDFHelpers.DAILY_COAL_PDF(req, grafikPath)
        return data
    }

    if(req.filterType === 'SHIFT'){
        const data = await ReportPDFHelpers.SHIFTLY_COAL_PDF(req, grafikPath)
        return data
    }

    if(req.filterType === 'HOURLY'){
        const data = await ReportPDFHelpers.HOURLY_COAL_PDF(req, grafikPath)
        return data
    }
}

/** DETAILS DATA DOWNLOAD **/
async function GEN_XLS (req) {
    // console.log('REQ ::::', req);
    if(req.filterType === 'MONTHLY'){
        const data = await ReportXLSHelpers.MONTHLY_XLS(req)
        return data
    }

    if(req.filterType === 'WEEKLY'){
        const data = await ReportXLSHelpers.WEEKLY_XLS(req)
        return data
    }

    if(req.filterType === 'DATE'){
        const data = await ReportXLSHelpers.DAILY_XLS(req)
        return data
    }

    if(req.filterType === 'SHIFT'){
        const data = await ReportXLSHelpers.SHIFTLY_XLS(req)
        return data
    }

    if(req.filterType === 'HOURLY'){
        const data = await ReportXLSHelpers.HOURLY_XLS(req)
        return data
    }
}
// async function GEN_XLS_OB (req) {
//     // console.log('REQ ::::', req);
//     if(req.filterType === 'MONTHLY'){
//         const data = await ReportXLSHelpers.MONTHLY_OB_XLS(req)
//         return data
//     }

//     if(req.filterType === 'WEEKLY'){
//         const data = await ReportXLSHelpers.WEEKLY_OB_XLS(req)
//         return data
//     }

//     if(req.filterType === 'DATE'){
//         const data = await ReportXLSHelpers.DAILY_OB_XLS(req)
//         return data
//     }

//     if(req.filterType === 'SHIFT'){
//         const data = await ReportXLSHelpers.SHIFTLY_OB_XLS(req)
//         return data
//     }

//     if(req.filterType === 'HOURLY'){
//         const data = await ReportXLSHelpers.HOURLY_OB_XLS(req)
//         return data
//     }
// }

// async function GEN_XLS_COAL (req) {
//     if(req.filterType === 'MONTHLY'){
//         const data = await ReportXLSHelpers.MONTHLY_COAL_XLS(req)
//         return data
//     }

//     if(req.filterType === 'WEEKLY'){
//         const data = await ReportXLSHelpers.WEEKLY_COAL_XLS(req)
//         return data
//     }

//     if(req.filterType === 'DATE'){
//         const data = await ReportXLSHelpers.DAILY_COAL_XLS(req)
//         return data
//     }

//     if(req.filterType === 'SHIFT'){
//         const data = await ReportXLSHelpers.SHIFTLY_COAL_XLS(req)
//         return data
//     }

//     if(req.filterType === 'HOURLY'){
//         const data = await ReportXLSHelpers.HOURLY_COAL_XLS(req)
//         return data
//     }
// }
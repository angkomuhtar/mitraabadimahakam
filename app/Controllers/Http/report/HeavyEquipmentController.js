'use strict'

const Helpers = use('Helpers')
const moment = require("moment")
const ReportPDFHelpers = use("App/Controllers/Http/Helpers/ReportPDF")
const ReportXLSHelpers = use("App/Controllers/Http/Helpers/ReportXLS")
const ReportHeavyEquipment = use("App/Controllers/Http/Helpers/ReportHeavyEquipment")

class HeavyEquipmentController {
    async index ( { auth, view } ) {
        return view.render('report.heavy-equipment.index')
    }

    async filter ( { request, view } ) {
        return view.render('report.heavy-equipment.filter')
    }

    async applyFilter ( { request } ) {
        let data
        const req = request.all()
        // console.log(req);
        if(req.inp_ranges === 'date'){
            data = await ReportHeavyEquipment.DAILY(req)
        }

        if(req.inp_ranges === 'week'){
            data = await ReportHeavyEquipment.WEEKLY(req)
        }

        if(req.inp_ranges === 'month'){
            data = await ReportHeavyEquipment.MONTHLY(req)
        }
        // console.log(data);
        return data
    }

    async kpiTable( { request, view } ) {
        let data
        const req = request.all()
        if(req.inp_ranges === 'date'){
            data = await ReportHeavyEquipment.DAILY(req)
        }

        if(req.inp_ranges === 'week'){
            data = await ReportHeavyEquipment.WEEKLY(req)
        }

        if(req.inp_ranges === 'month'){
            data = await ReportHeavyEquipment.MONTHLY(req)
        }

        return view.render('report.heavy-equipment.tableKPI', {list: data.byKPI.dataTable})
    }

    async genDataPDF ( { request } ) {
        const req = request.all()
        const attchmentKPI = request.file('ImgKpi')
        const attchmentRatio = request.file('ImgRatio')
        const attchmentDuration = request.file('ImgDuration')
        const attchmentEvent = request.file('ImgEvent')

        if(attchmentKPI){
            const randURL = moment().format('YYYYMMDDHHmm')
            const aliasName = `chart-KPI-${req.unit_model}-${req.inp_ranges}-${randURL}.png`
            var imageKPIPath = '/upload/'+aliasName

            req.imageKPI = imageKPIPath

            await attchmentKPI.move(Helpers.publicPath(`upload`), {
                name: aliasName,
                overwrite: true,
            })
            if (!attchmentKPI.moved()) {
                console.log(attchmentKPI.error());
                return 'gagal simpan gambar....'
            }
        }

        if(attchmentRatio){
            const randURL = moment().format('YYYYMMDDHHmm')
            const aliasName = `chart-BDRatio-${req.unit_model}-${req.inp_ranges}-${randURL}.png`
            var imageRatioPath = '/upload/'+aliasName

            req.imageRatio = imageRatioPath

            await attchmentRatio.move(Helpers.publicPath(`upload`), {
                name: aliasName,
                overwrite: true,
            })
            if (!attchmentRatio.moved()) {
                console.log(attchmentRatio.error());
                return 'gagal simpan gambar....'
            }
        }

        if(attchmentDuration){
            const randURL = moment().format('YYYYMMDDHHmm')
            const aliasName = `chart-BDDuration-${req.unit_model}-${req.inp_ranges}-${randURL}.png`
            var imageDurationPath = '/upload/'+aliasName

            req.imageDuration = imageDurationPath

            await attchmentDuration.move(Helpers.publicPath(`upload`), {
                name: aliasName,
                overwrite: true,
            })
            if (!attchmentDuration.moved()) {
                console.log(attchmentDuration.error());
                return 'gagal simpan gambar....'
            }
        }

        if(attchmentEvent){
            const randURL = moment().format('YYYYMMDDHHmm')
            const aliasName = `chart-BDEvent-${req.unit_model}-${req.inp_ranges}-${randURL}.png`
            var imageEventPath = '/upload/'+aliasName

            req.imageEvent = imageEventPath

            await attchmentEvent.move(Helpers.publicPath(`upload`), {
                name: aliasName,
                overwrite: true,
            })
            if (!attchmentEvent.moved()) {
                console.log(attchmentEvent.error());
                return 'gagal simpan gambar....'
            }
        }

       
        let data

        if(req.inp_ranges === 'date'){
            data = await ReportHeavyEquipment.DAILY(req)
        }

        if(req.inp_ranges === 'week'){
            data = await ReportHeavyEquipment.WEEKLY(req)
        }

        if(req.inp_ranges === 'month'){
            data = await ReportHeavyEquipment.MONTHLY(req)
        }

        if(data.success){
            const result = await ReportPDFHelpers.KPI_PERFORMANCES(req, data)
            return result
        }
    }
    
    async genDataXLS ( { request } ) {
        
        
    }
}

module.exports = HeavyEquipmentController

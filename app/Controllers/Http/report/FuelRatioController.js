'use strict'

const Helpers = use('Helpers')
const moment = require("moment")
const ReportPDFHelpers = use("App/Controllers/Http/Helpers/ReportPDF")
const ReportXLSHelpers = use("App/Controllers/Http/Helpers/ReportXLS")
const ReportFuelRatioHelpers = use("App/Controllers/Http/Helpers/ReportFuelRatio")

class FuelRatioController {
    async index ( { auth, view } ) {
        console.log('xxx');
        return view.render('report.fuel-ratio.index')
    }

    async filter ( { request, view } ) {
        console.log('xxx');
        return view.render('report.fuel-ratio.filter')
        
    }

    async applyFilter ( { request } ) {
        const req = request.all()
        console.log(req);
        if(req.range_type === 'pit'){
            const data = await ReportFuelRatioHelpers.PIT_WISE(req)
            console.log(data);
            return data
        }else{
            const data = await ReportFuelRatioHelpers.PERIODE_WISE(req)
            console.log(data);
            return data
        }
    }

    async genDataPDF ( { request } ) {
        const req = request.all()
        console.log(req);
        const attchment = request.file('chartImg')

        if(attchment){
            const randURL = moment().format('YYYYMMDDHHmm')
            const aliasName = `chart-fuelratio-${req.range_type}-${req.inp_ranges}-${randURL}.png`
            var imagePath = '/upload/'+aliasName

            req.imagePath = imagePath

            await attchment.move(Helpers.publicPath(`upload`), {
                name: aliasName,
                overwrite: true,
            })
            if (!attchment.moved()) {
                console.log(attchment.error());
                return 'gagal simpan gambar....'
            }
        }

        if(req.range_type === 'pit'){
            const data = await ReportPDFHelpers.PIT_FUEL_RATIO_PDF(req)
            return data
        }else{
            const data = await ReportPDFHelpers.PERIODE_FUEL_RATIO_PDF(req)
            return data
        }
        
    }
    
    async genDataXLS ( { request } ) {
        const req = request.all()
        console.log(req);
        const attchment = request.file('chartImg')

        if(attchment){
            const randURL = moment().format('YYYYMMDDHHmm')
            const aliasName = `chart-fuelratio-${req.range_type}-${req.inp_ranges}-${randURL}.png`
            var imagePath = '/upload/'+aliasName

            req.imagePath = imagePath

            await attchment.move(Helpers.publicPath(`upload`), {
                name: aliasName,
                overwrite: true,
            })
            if (!attchment.moved()) {
                console.log(attchment.error());
                return 'gagal simpan gambar....'
            }
        }

        if(req.range_type === 'pit'){
            const data = await ReportXLSHelpers.PIT_FUEL_RATIO_XLS(req)
            return data
        }else{
            const data = await ReportXLSHelpers.PERIODE_FUEL_RATIO_XLS(req)
            return data
        }
        
    }
}

module.exports = FuelRatioController

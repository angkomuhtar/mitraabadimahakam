'use strict'

const Helpers = use('Helpers')
const moment = require("moment")
const ReportPDFHelpers = use("App/Controllers/Http/Helpers/ReportPDF")
const ReportXLSHelpers = use("App/Controllers/Http/Helpers/ReportXLS")
const ReportFuelRatioHelpers = use("App/Controllers/Http/Helpers/ReportFuelRatio")

class HeavyEquipmentController {
    async index ( { auth, view } ) {
        return view.render('report.heavy-equipment.index')
    }

    async filter ( { request, view } ) {
        return view.render('report.heavy-equipment.filter')
    }

    async applyFilter ( { request } ) {
        const req = request.all()
        console.log(req);
        
    }

    async genDataPDF ( { request } ) {
        
        
    }
    
    async genDataXLS ( { request } ) {
        
        
    }
}

module.exports = HeavyEquipmentController

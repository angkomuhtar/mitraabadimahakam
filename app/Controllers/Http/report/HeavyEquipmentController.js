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
        console.log(req);
        if(req.inp_ranges === 'date'){
            data = await ReportHeavyEquipment.DAILY()
        }

        if(req.inp_ranges === 'week'){
            data = await ReportHeavyEquipment.WEEKLY()
        }

        if(req.inp_ranges === 'month'){
            data = await ReportHeavyEquipment.MONTHLY()
        }

        console.log('====================================');
        console.log(data);
        console.log('====================================');
    }

    async genDataPDF ( { request } ) {
        
        
    }
    
    async genDataXLS ( { request } ) {
        
        
    }
}

module.exports = HeavyEquipmentController

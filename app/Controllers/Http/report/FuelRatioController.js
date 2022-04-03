'use strict'

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
        console.log('====================================');
        console.log(req);
        console.log('====================================');
        if(req.range_type === 'pit'){
            const data = await ReportFuelRatioHelpers.PIT_WISE(req)
            console.log(data);
            return data
        }else{
            const data = await ReportFuelRatioHelpers.PERIODE_WISE(req)
            return data
        }
    }
}

module.exports = FuelRatioController

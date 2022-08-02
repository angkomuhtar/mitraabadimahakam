'use strict'

const version = '2.0'
const _ = require('underscore')
const moment = require("moment")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const ReportFuelRatioHelpers = use("App/Controllers/Http/Helpers/ReportFuelRatio")

class ReportFuelRatioController {
    async index ( { auth, request, response } ) {
        let durasi
        var t0 = performance.now()
        var req = request.all()
        console.log(req);
        const user = await userValidate(auth)
        if(!user){
            return response.status(403).json({
                diagnostic: {
                    ver: version,
                    error: true,
                    message: 'not authorized...'
                }
            })
        }
        req.colorGraph = [ '#7ab2fa', '#1074f7', '#0451b6' ]
        
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
}

module.exports = ReportFuelRatioController

async function userValidate(auth){
    let user
    try {
        user = await auth.authenticator('jwt').getUser()
        return user
    } catch (error) {
        console.log(error);
        return null
    }
}
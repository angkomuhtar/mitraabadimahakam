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
        // console.log(req);
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

        console.log('====================================');
        console.log(moment(req.start).format('YYYY-[W]ww'));
        console.log(moment(req.end).format('YYYY-[W]ww'));
        console.log('====================================');

        if(req.inp_ranges === 'week'){
            req.start = moment(req.start).format('YYYY-[W]ww')
            req.end = moment(req.end).format('YYYY-[W]ww')
        }
        
        if(req.range_type === 'pit'){
            try {
                const data = await ReportFuelRatioHelpers.PIT_WISE(req)
                let resultPIT = {
                    site: data.site,
                    pit: data.pit,
                    staticRatio: data.staticRatio,
                    dataCurrent: data.series.map((val, c) => {
                        return {
                            name: val.name,
                            frontColor: req.colorGraph[c],
                            values: val.data.map((obj, i) => {
                                return {
                                    value: obj,
                                    label: data.xAxis[i]
                                }
                            })
                        }
                    }),
                    dataCummulative: data.cummSeries?.map(val => {
                        return {
                            name: val.name,
                            values: val.data.map((obj, i) => {
                                return {
                                    value: obj,
                                    label: data.cummxAxis[i]
                                }
                            })
                        }
                    })
                }
                durasi = await diagnoticTime.durasi(t0);
                return response.status(200).json({
                    diagnostic: {
                        ver: version,
                        times: durasi,
                        error: false,
                    },
                    data: resultPIT,
                });
            } catch (error) {
                durasi = await diagnoticTime.durasi(t0);
                return response.status(403).json({
                    diagnostic: {
                        ver: version,
                        times: durasi,
                        error: true,
                        message: error,
                    },
                    data: [],
                });
            }
        }else{
            try {
                const data = await ReportFuelRatioHelpers.PERIODE_WISE(req)
                let resultPeriode = {
                    site: data.site,
                    dataCurrent: data.series.map((val, c) => {
                        return {
                            name: val.name,
                            frontColor: req.colorGraph[c],
                            values: val.data.map((obj, i) => {
                                return {
                                    value: obj,
                                    label: data.xAxis[i]
                                }
                            })
                        }
                    }),
                    dataCummulative: data.cummSeries?.map(val => {
                        return {
                            name: val.name,
                            values: val.data.map((obj, i) => {
                                return {
                                    value: obj,
                                    label: data.cummxAxis[i]
                                }
                            })
                        }
                    })
                }
                durasi = await diagnoticTime.durasi(t0);
                return response.status(200).json({
                    diagnostic: {
                        ver: version,
                        times: durasi,
                        error: false,
                    },
                    data: resultPeriode,
                });
            } catch (error) {
                durasi = await diagnoticTime.durasi(t0);
                return response.status(403).json({
                    diagnostic: {
                        ver: version,
                        times: durasi,
                        error: true,
                        message: error,
                    },
                    data: [],
                });
            }
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
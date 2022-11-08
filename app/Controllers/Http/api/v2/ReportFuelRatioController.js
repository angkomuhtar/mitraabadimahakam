'use strict'

const version = '2.0'
const fs = require("fs")
const _ = require('underscore')
const moment = require("moment")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const ReportPDFHelpers = use("App/Controllers/Http/Helpers/ReportPDF")
const ReportFuelRatioHelpers = use("App/Controllers/Http/Helpers/ReportFuelRatio")

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
        if(req.inp_ranges === 'WEEK'){
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
                    startDate : data.startDate,
                    endDate : data.endDate
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
                console.log('====================================');
                console.log(data);
                console.log('====================================');
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

    async list ( { auth, request, response } ) {
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

        if(req.inp_ranges === 'week'){
            req.start = moment(req.start).format('YYYY-[W]ww')
            req.end = moment(req.end).format('YYYY-[W]ww')
        }

        if(req.range_type === 'pit'){
            try {
                const data = await ReportFuelRatioHelpers.PIT_WISE_LIST(req)
                durasi = await diagnoticTime.durasi(t0);
                return response.status(200).json({
                    diagnostic: {
                        ver: version,
                        times: durasi,
                        error: false,
                    },
                    data: data,
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
                const data = await ReportFuelRatioHelpers.PERIODE_WISE_LIST(req)
                durasi = await diagnoticTime.durasi(t0);
                return response.status(200).json({
                    diagnostic: {
                        ver: version,
                        times: durasi,
                        error: false,
                    },
                    data: data,
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

    async pdf ( { auth, request, response } ) {
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

        if(req.inp_ranges === 'week'){
            req.start = moment(req.start).format('YYYY-[W]ww')
            req.end = moment(req.end).format('YYYY-[W]ww')
        }

        req.imagePath = null

        const pit = await MasPit.query().where('id', req.pit_id).last()
        const site = await MasSite.query().where('id', req.site_id).last()
        var fileName = user.id + '-' + moment(req.start).format('YYMMDD') + '-' + moment(req.end).format('YYMMDD') + '-' + site.kode + '-' + pit.kode + '-' + req.range_type + '-' + req.inp_ranges

        try {
            if (fs.existsSync(`public/download/${fileName}.pdf`)) {
                fs.unlinkSync(`public/download/${fileName}.pdf`)
                console.log('SUCCESS DELETE FILES...');
            }
        } catch(err) {
            console.log('FAILED DELETE FILES...');
            console.error(err)
        }

        if(req.range_type === 'pit'){
            try {
                const data = await ReportPDFHelpers.PIT_FUEL_RATIO_PDF(req)
                const pdfDocGenerator = pdfMake.createPdf(data);
                const pdfData = await BUILD_PDF(pdfDocGenerator)

                /* SAVING BASE64 TO FILE */
                var base64Data = pdfData.replace(/^data:application\/pdf;base64,/,"")
                let buff = Buffer.from(base64Data, 'base64');
                

                fs.writeFileSync(`public/download/${fileName}.pdf`, buff);
                durasi = await diagnoticTime.durasi(t0);
                return response.status(200).json({
                    diagnostic: {
                        ver: version,
                        times: durasi,
                        error: false,
                    },
                    data: {
                        site: site.name,
                        uri: `/download/${fileName}.pdf`,
                        data: pdfData
                    }
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
                const data = await ReportPDFHelpers.PERIODE_FUEL_RATIO_PDF(req)
                const pdfDocGenerator = pdfMake.createPdf(data);
                const pdfData = await BUILD_PDF(pdfDocGenerator)

                /* SAVING BASE64 TO FILE */
                var base64Data = pdfData.replace(/^data:application\/pdf;base64,/,"")
                let buff = Buffer.from(base64Data, 'base64');
                

                fs.writeFileSync(`public/download/${fileName}.pdf`, buff);
                durasi = await diagnoticTime.durasi(t0);
                return response.status(200).json({
                    diagnostic: {
                        ver: version,
                        times: durasi,
                        error: false,
                    },
                    data: {
                        site: site.name,
                        uri: `/download/${fileName}.pdf`,
                        data: pdfData
                    },
                });
            } catch (error) {
                console.log(error);
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

async function BUILD_PDF(pdfDocGen){
    return new Promise((resolve, reject) => {
      pdfDocGen.getDataUrl((dataUrl) => {
            resolve(dataUrl)
        });
    })
}
'use strict'

const version = '2.0'
const fs = require("fs")
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require("moment")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")
const QuickChart = require('quickchart-js')
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const MasEquipment = use('App/Models/MasEquipment')
const ReportPDFHelpers = use("App/Controllers/Http/Helpers/ReportPDF")
const ReportHeavyEquipment = use("App/Controllers/Http/Helpers/ReportHeavyEquipment")

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

class ReportHeavyEquipmentPerformanceController {
    async index ( { auth, request, response } ) {
        let data
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

        // let grafikPerformance = []
        // let dataPerformance = []

        // let grafikPieBreakdown = []
        // let dataPieBreakdown = []

        // let grafikDuration = []
        // let grafikEvent = []
        // let dataEvent = []

        if(req.inp_ranges === 'DAILY'){
            req.start_date = req.start
            req.end_date = req.end
            data = await ReportHeavyEquipment.DAILY(req)
        }
        
        if(req.inp_ranges === 'WEEKLY'){
            req.start_week = moment(req.start).format('YYYY-[W]ww')
            req.end_week = moment(req.end).format('YYYY-[W]ww')
            data = await ReportHeavyEquipment.WEEKLY(req)
        }
        
        if(req.inp_ranges === 'MONTHLY'){
            req.start_month = moment(req.start).startOf('month').format('YYYY-MM-DD')
            req.end_month = moment(req.end).endOf('month').format('YYYY-MM-DD')
            data = await ReportHeavyEquipment.MONTHLY(req)
        }
        const result = await BUILD_CHART (data)

        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
            diagnostic: {
                ver: version,
                times: durasi,
                error: false,
            },
            result
        });
    }

    async pdf ( { auth, request, response } ) {
        let data
        let durasi
        var t0 = performance.now()
        var req = request.all()
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
        const site = await MasSite.query().where('id', req.site_id).last()
        var fileName = user.id + '-' + moment(req.start).format('YYMMDD') + '-' + moment(req.end).format('YYMMDD') + '-' + site.kode + '-' + req.range_type + '-' + req.inp_ranges

        try {
            if (fs.existsSync(`public/download/${fileName}.pdf`)) {
                fs.unlinkSync(`public/download/${fileName}.pdf`)
                console.log('SUCCESS DELETE FILES...');
            }
        } catch(err) {
            console.log('FAILED DELETE FILES...');
            console.error(err)
        }

        if(req.inp_ranges === 'DAILY'){
            req.start_date = req.start
            req.end_date = req.end
            data = await ReportHeavyEquipment.DAILY(req)
        }
        
        if(req.inp_ranges === 'WEEKLY'){
            req.start_week = moment(req.start).format('YYYY-[W]ww')
            req.end_week = moment(req.end).format('YYYY-[W]ww')
            data = await ReportHeavyEquipment.WEEKLY(req)
        }
        
        if(req.inp_ranges === 'MONTHLY'){
            req.start_month = moment(req.start).startOf('month').format('YYYY-MM-DD')
            req.end_month = moment(req.end).endOf('month').format('YYYY-MM-DD')
            data = await ReportHeavyEquipment.MONTHLY(req)

            const chartData = await BUILD_CHART(data)
            const { grafikPerformance } = chartData.data
            
            const myChart = new QuickChart();
            myChart.setConfig({
                type: 'bar',
                data: { 
                    labels: grafikPerformance.map(l => l.label), 
                    datasets: [
                        { label: 'Foo', data: grafikPerformance.map(d => d.value != NaN ? d.value : 0) }
                    ] 
                },
            });
            // req.urlKPI = myChart.getUrl()
            
            if(data.success){
                const result = await ReportPDFHelpers.KPI_PERFORMANCES(req, data)
                const pdfDocGenerator = pdfMake.createPdf(result)
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
                        // site: site?.name,
                        uri: `/download/${fileName}.pdf`,
                        data: pdfData
                    }
                });
            }
            // console.log(pdfDocGenerator);
        }


        // return pdfDocGenerator
        // console.log('====================================');
        // console.log(data.byKPI);
        // console.log('====================================');
    }

    async equipmentList( { auth, request, response } ) {

        const { site_id } = request.all();
        const equipments = (
            await MasEquipment.query()
              .where(wh => {
                wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer', 'compaq', 'oth'])
                wh.where('aktif', 'Y')
                wh.where('site_id', site_id)
              })
              .fetch()
          ).toJSON()

        const parsedEquipment = equipments.map((v) => {
            return {
                id : String(v.id),
                title : v.kode
            }
        })

        return {
            data : parsedEquipment
        }
    }
}

module.exports = ReportHeavyEquipmentPerformanceController

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

async function BUILD_CHART (data) {
    let grafikPerformance = []
    let dataPerformance = []
    let grafikPieBreakdown = []
    let dataPieBreakdown = []
    let grafikDuration = []
    let grafikEvent = []
    let dataEvent = []

    const HePerformance = data.byKPI.dataTable
    dataPerformance = HePerformance
    for (const val of HePerformance) {
        grafikPerformance.push({
            value: parseFloat((val.actPA)?.toFixed(2)), 
            label: val.date,
            name: 'actual'
        })
        grafikPerformance.push({
            value: parseFloat((val.budgetPA)?.toFixed(2)), 
            label: val.date,
            name: 'plan'
        })
    }
    const RatioBreakdown = data.byDataRatio
    for (const val of RatioBreakdown) {
        grafikPieBreakdown.push({
            name: val.name,
            value: parseFloat((val.persen).toFixed(2)),
            label: val.name
        })
        for (const obj of val.items) {
            dataPieBreakdown.push(obj)
        }
    }
    for (let i = 0; i < data.byDuration.series[0].data.length; i++) {
        grafikDuration.push({
            value: data.byDuration.series[0].data[i],
            label: data.byDuration.xAxis[i]
        })
    }
    for (let i = 0; i < data.byEvents.series[0].data.length; i++) {
        grafikEvent.push({
            value: data.byDuration.series[0].data[i],
            label: data.byDuration.xAxis[i]
        })
    }

    return {
        data: {
            grafikPerformance,
            dataPerformance,
            grafikPieBreakdown,
            dataPieBreakdown,
            grafikDuration,
            grafikEvent,
            dataEvent: data.dataEvent
        }
    }
}
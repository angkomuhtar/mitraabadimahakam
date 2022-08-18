'use strict'

const DB = use('Database')
const moment = require("moment")
const _ = require('underscore')
const MamFuelRatio = use("App/Models/MamFuelRatio")
const DailyRitase = use("App/Models/DailyRitase")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")

class repFuelRatio {
    async PIT_WISE (req) {
        console.log('<< BY PIT FUEL RATIO >>');
        console.log(req);

        const avgDistance = await DailyRitase.query().where( w => {
            w.where('site_id', req.site_id)
            w.where('pit_id', req.pit_id)
            w.where('date', '>=', req.start)
            w.where('date', '<=', req.end)
        }).getAvg('distance')


        const { ratio, distances } = await DB.from('mam_fuel_ratios_config').where( w => {
            w.where('distances', '>=', avgDistance)
            w.where('distances', '<=', (avgDistance + 200))
        }).last()

        // console.log(ratio, distances);

        /* GET DATA FUEL RATIO */
        let color = req.colorGraph
        let result = []
        let cumm = []
        let data
        let xAxis
        let cummxAxis

        const site = await MasSite.query().where('id', req.site_id).last()
        const pit = await MasPit.query().where('id', req.pit_id).last()

        /* MONTHLY FUEL RATIO BY PIT */
        if(req.inp_ranges == 'MONTHLY'){
            data = (
                await MamFuelRatio.query().where( w => {
                    w.where('site_id', req.site_id)
                    w.where('pit_id', req.pit_id)
                    w.where('date', '>=', req.start)
                    w.where('date', '<=', req.end)
                }).orderBy('date').fetch()
            ).toJSON()

            data = data.map( val => {
                return {
                    ...val,
                    date: moment(val.date).format('MMMM YYYY')
                }
            })
            data = _.groupBy(data, 'date')
            data = Object.keys(data).map( key => {
                return {
                    date: key,
                    ob: data[key].reduce((a, b) => { return a + b.ob }, 0) / data[key].length,
                    coal_mt: data[key].reduce((a, b) => { return a + b.coal_mt }, 0) / data[key].length,
                    coal_bcm: data[key].reduce((a, b) => { return a + b.coal_bcm }, 0) / data[key].length,
                    fuel_used: data[key].reduce((a, b) => { return a + b.fuel_used }, 0) / data[key].length,
                    fuel_ratio: data[key].reduce((a, b) => { return a + b.fuel_ratio }, 0) / data[key].length,
                    fuel_ratio: data[key].reduce((a, b) => { return a + b.fuel_ratio }, 0) / data[key].length,
                    cum_production: _.last(data[key]).cum_production,
                    cum_fuel_used: _.last(data[key]).cum_fuel_used,
                    cum_fuel_ratio: _.last(data[key]).cum_fuel_ratio,
                }
            })

            xAxis = data.map(el => moment(el.date, "MMMM YYYY").format('MM/YY'))
            cummxAxis = data.map(el => moment(el.date, "MMMM YYYY").format('MM/YY'))
        }


        /* WEEKLY FUEL RATIO BY PIT */
        if(req.inp_ranges == 'WEEKLY'){
            data = (
                await MamFuelRatio.query().where( w => {
                    w.where('site_id', req.site_id)
                    w.where('pit_id', req.pit_id)
                    w.where('date', '>=', req.start)
                    w.where('date', '<=', req.end)
                }).orderBy('date').fetch()
            ).toJSON()

            data = data.map( val => ({...val, date: moment(val.date).startOf('week').format("YYYY-[W]ww")}))
            data = _.groupBy(data, 'date')
            data = Object.keys(data).map( key => {
                return {
                    date: key,
                    ob: data[key].reduce((a, b) => { return a + b.ob }, 0) / data[key].length,
                    coal_mt: data[key].reduce((a, b) => { return a + b.coal_mt }, 0) / data[key].length,
                    coal_bcm: data[key].reduce((a, b) => { return a + b.coal_bcm }, 0) / data[key].length,
                    fuel_used: data[key].reduce((a, b) => { return a + b.fuel_used }, 0) / data[key].length,
                    fuel_ratio: data[key].reduce((a, b) => { return a + b.fuel_ratio }, 0) / data[key].length,
                    fuel_ratio: data[key].reduce((a, b) => { return a + b.fuel_ratio }, 0) / data[key].length,
                    cum_production: _.last(data[key]).cum_production,
                    cum_fuel_used: _.last(data[key]).cum_fuel_used,
                    cum_fuel_ratio: _.last(data[key]).cum_fuel_ratio,
                }
            })

            xAxis = data.map(el => 'W[' + (parseInt(moment(el.date, "YYYY-[W]ww").week()) - 1) + ']')
            cummxAxis = data.map(el => 'W[' + (parseInt(moment(el.date, "YYYY-[W]ww").week() - 1 )) + ']')
        }

        if(req.inp_ranges == 'DAILY'){
            data = (
                await MamFuelRatio.query().where( w => {
                    w.where('site_id', req.site_id)
                    w.where('pit_id', req.pit_id)
                    w.where('date', '>=', req.start)
                    w.where('date', '<=', req.end)
                }).orderBy('date').fetch()
            ).toJSON()
            xAxis = data.map(el => moment(el.date).format('DD MMM YYYY'))
            cummxAxis = data.map(el => moment(el.date).format('DD MMM YYYY'))
        }
        


        
        result.push({
            name: 'Fuel Ratio',
            type: req.typeChart,
            color: color[0],
            data: data.map(el => el.fuel_ratio),
            dataLabels: {
                enabled: true,
                // color: '#FFFFFF',
                format: '{point.y:.2f}'
            }
        })

        result.push({
            name: 'Budget Ratio',
            type: 'spline',
            color: 'red',
            data: data.map(el => ratio),
            dashStyle: 'shortdot',
            width: 0.1,
            dataLabels: {
                enabled: false,
                // color: '#FFFFFF',
                format: '{point.y:.2f}%'
            }
        })
        
        cumm = [
            
            {
                name: 'Cumm Fuel Used',
                type: req.typeChart,
                color: color[0],
                data: data.map(el => el.cum_fuel_used),
                dataLabels: {
                    enabled: true,
                    y: 5,
                    format: '{point.y:.2f}'
                }
            },
            {
                name: 'Cumm Production',
                type: req.typeChart,
                yAxis: 0,
                color: color[1],
                data: data.map(el => el.cum_production),
                dataLabels: {
                    enabled: true,
                    y: -15,
                    format: '{point.y:.2f}'
                }
            },
            {
                name: 'Cumm Fuel Ratio',
                type: 'spline',
                color: 'red',
                yAxis: 1,
                data: data.map(el => el.cum_fuel_ratio),
                dataLabels: {
                    enabled: true,
                    y: 5,
                    format: '{point.y:.2f}'
                }
            }
        ]

        return {
            site: site?.toJSON(),
            pit: pit?.toJSON(),
            xAxis: xAxis,
            staticRatio: ratio,
            series: result,
            cummxAxis: cummxAxis,
            cummSeries: cumm
        }
    }

    async PERIODE_WISE (req) {
        console.log(req);
        let result = []
        let cummulative = []
        let cummxAxis = []
        let cumm = []
        let color = req.colorGraph
        const site = await MasSite.query().where('id', req.site_id).last()

        /* CARI JARAK RATA-RATA */
        const avgDistance = await DailyRitase.query().where( w => {
            w.where('site_id', req.site_id)
            if(req.inp_ranges == 'WEEKLY'){
                w.where('date', '>=', moment(req.start).startOf('week').format('YYYY-MM-DD'))
                w.where('date', '<=', moment(req.end).endOf('week').format('YYYY-MM-DD'))
            }else{
                w.where('date', '>=', req.start)
                w.where('date', '<=', req.end)
            }
        }).getAvg('distance')

        

        const { ratio, distances } = await DB.from('mam_fuel_ratios_config').where( w => {
            w.where('distances', '>=', avgDistance)
            w.where('distances', '<=', (avgDistance + 200))
        }).last()

        /* GET DATA FUEL RATIO DAILY */
        if(req.inp_ranges == 'DAILY'){ //daily
            let data = (
                await MamFuelRatio.query().where( w => {
                    w.where('site_id', req.site_id)
                    w.where('date', '>=', req.start)
                    w.where('date', '<=', req.end)
                }).orderBy('date').fetch()
            ).toJSON()
            data = data.map(el => {
                return {
                    ...el,
                    date: moment(el.date).format('YYYY-MM-DD')
                }
            })

            data = _.groupBy(data, 'date')
            data = Object.keys(data).map(key => {
                return {
                    date: moment(key).format('YYYY-MM-DD'),
                    items: data[key].map(el => {
                        return {
                            pit_id: el.pit_id,
                            fuel_ratio: el.fuel_ratio,
                            cumProduction: el.cum_production,
                            cumFuelUsed: el.cum_fuel_used
                        }
                    })
                }
            })

            cummulative = data.map(obj => {
                var cumProduction = obj.items.reduce((a, b) => { return a + b.cumProduction }, 0)
                var cumFuelUsed = obj.items.reduce((a, b) => { return a + b.cumFuelUsed }, 0)
                return {
                    date: obj.date,
                    cumProduction: cumProduction,
                    cumFuelUsed: cumFuelUsed,
                    cumFuelRatio: cumProduction > 0 ? (cumProduction / cumFuelUsed) : 0
                }
            })

            cummxAxis = data.map(el => moment(el.date).format('DD MMM YYYY'))
            cumm = [
                
                {
                    name: 'Cumm Fuel Used',
                    type: req.typeChart,
                    color: color[0],
                    data: cummulative.map(el => el.cumFuelUsed),
                    dataLabels: {
                        enabled: true,
                        y: 5,
                        format: '{point.y:.2f}'
                    }
                },
                {
                    name: 'Cumm Production',
                    type: req.typeChart,
                    yAxis: 0,
                    color: color[1],
                    data: cummulative.map(el => parseFloat((el.cumProduction).toFixed('2'))),
                    dataLabels: {
                        enabled: true,
                        y: -15,
                        format: '{point.y:.2f}'
                    }
                },
                {
                    name: 'Cumm Fuel Ratio',
                    type: 'spline',
                    color: 'red',
                    yAxis: 1,
                    data: cummulative.map(el => parseFloat((el.cumFuelRatio).toFixed(2))),
                    dataLabels: {
                        enabled: true,
                        y: 5,
                        format: '{point.y:.2f}'
                    }
                }
            ]


            let xAxis = []
            let res = []
            for (const obj of data) {
                xAxis.push(obj.date)
                for (const val of obj.items) {
                    const pit = (await MasPit.query().where('id', val.pit_id).last()).toJSON()
                    res.push({
                        name: pit.name,
                        data: val.fuel_ratio
                    })
                    
                }
            }
            

            
            res = _.groupBy(res, 'name')
            res = Object.keys(res).map((key, i) => {
                return {
                    name: key,
                    stack: key,
                    type: req.typeChart,
                    color: color[i],
                    data: res[key].map(el => el.data),
                    dataLabels: {
                        enabled: true,
                        align: 'top',
                        format: '{point.y:.2f}', // one decimal
                        style: {
                            fontSize: '11px',
                            fontFamily: 'sans-serif',
                        }
                    },
                    pointPadding: 0.1,
                    groupPadding: 0
                }
            })

            res.push({
                name: 'Budget Ratio',
                type: 'spline',
                color: 'red',
                data: data.map(el => ratio),
                dashStyle: 'shortdot',
                width: 0.1,
                dataLabels: {
                    enabled: false,
                    // color: '#FFFFFF',
                    format: '{point.y:.2f}%'
                }
            })
            

            return {
                site: site?.toJSON(),
                xAxis: xAxis,
                series: res,
                cummxAxis: cummxAxis,
                cummSeries: cumm
            }
        }

        /* GET DATA FUEL RATIO WEEKLY */
        if(req.inp_ranges == 'WEEKLY'){ // weekly
            let result = []
            
            let arrDate = []

            var x = moment(req.start).week()
            var y = moment(req.end).week()
            for (let i = x - 1; i < y; i++) {
                var str = '-W'+'0'.repeat(2 - `${i}`.length) + i
                var arrStart = moment(moment(req.start).format('YYYY') + str).startOf('week').add(1, 'day')
                var arrEnd = moment(moment(req.end).format('YYYY') + str).endOf('week').add(1, 'day')

                var getDaysBetweenDates = function(startDate, endDate) {
                    var now = startDate.clone(), dates = [];
            
                    while (now.isSameOrBefore(endDate)) {
                        dates.push(now.format('YYYY-MM-DD'));
                        now.add(1, 'days');
                    }
                    return dates;
                };

                var arrTgl = getDaysBetweenDates(arrStart, arrEnd)
                arrDate.push({
                    date: 'W['+i+']',
                    site_id: req.site_id,
                    items: arrTgl
                })
            }


            let xAxis = arrDate.map(el => el.date)
            /* GET LIST PIT */
            const pit = (
                await MasPit.query().where( w => {
                    w.where('sts', 'Y')
                    w.where('site_id', req.site_id)
                }).fetch()
            ).toJSON()

            for (const val of pit) {
                for (const elm of arrDate) {
                    
                    const sumOB = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('ob') || 0
                    
                    const sumCoal = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('coal_bcm') || 0

                    const sumFuel = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('fuel_used') || 0

                    result.push({
                        name: val.name,
                        cumProduction: sumOB + sumCoal,
                        cumFuelUsed: sumFuel,
                        // cumFuelRatio: cumProduction > 0 ? (cumProduction / cumFuelUsed) : 0,
                        data: parseFloat(((sumOB + sumCoal) / sumFuel).toFixed(2)) || 0
                    });
                }
            }
            
            /* CUMMULATIVE WEEKLY DATA */
            let cummWeek = []
            for (const elm of arrDate) {
                const sumCummOB = await MamFuelRatio.query().where( w => {
                    w.where('date', '>=', _.first(elm.items))
                    w.where('date', '<=', _.last(elm.items))
                }).getSum('ob') || 0
                
                const sumCummCoal = await MamFuelRatio.query().where( w => {
                    w.where('date', '>=', _.first(elm.items))
                    w.where('date', '<=', _.last(elm.items))
                }).getSum('coal_bcm') || 0

                const sumCummFuel = await MamFuelRatio.query().where( w => {
                    w.where('date', '>=', _.first(elm.items))
                    w.where('date', '<=', _.last(elm.items))
                }).getSum('fuel_used') || 0

                cummWeek.push({
                    cumProduction: sumCummOB + sumCummCoal,
                    cumFuelUsed: sumCummFuel,
                    data: (sumCummOB + sumCummCoal) / sumCummFuel || 0
                });
            }
            cumm = [
                
                {
                    name: 'Cumm Fuel Used',
                    type: req.typeChart,
                    color: color[0],
                    data: cummWeek.map(el => el.cumFuelUsed),
                    dataLabels: {
                        enabled: true,
                        y: 5,
                        format: '{point.y:.2f}'
                    }
                },
                {
                    name: 'Cumm Production',
                    type: req.typeChart,
                    yAxis: 0,
                    color: color[1],
                    data: cummWeek.map(el => parseFloat((el.cumProduction).toFixed('2'))),
                    dataLabels: {
                        enabled: true,
                        y: -15,
                        format: '{point.y:.2f}'
                    }
                },
                {
                    name: 'Cumm Fuel Ratio',
                    type: 'spline',
                    color: 'red',
                    yAxis: 1,
                    data: cummWeek.map(el => parseFloat((el.data).toFixed('2'))),
                    dataLabels: {
                        enabled: true,
                        y: 5,
                        format: '{point.y:.2f}'
                    }
                }
            ]
            // let color = req.colorGraph
            result = _.groupBy(result, 'name')
            result = Object.keys(result).map((key, i) => {
                return {
                    name: key,
                    stack: key,
                    type: req.typeChart,
                    color: color[i] || 'red',
                    data: result[key].map( el => parseFloat((el.data).toFixed(2))),
                    dataLabels: {
                        enabled: true,
                        align: 'top',
                        format: '{point.y:.2f}', // one decimal
                        style: {
                            fontSize: '11px',
                            fontFamily: 'sans-serif',
                        }
                    },
                    pointPadding: 0.1,
                    groupPadding: 0
                }
            })
            
            return {
                site: site,
                xAxis: xAxis,
                series: result,
                cummxAxis: xAxis,
                cummSeries: cumm
            }
        }

        if(req.inp_ranges == 'MONTHLY'){ // monthly
            let result = []
            let arrMonth = []

            var startDate = moment(req.start);
            var endDate = moment(req.end);

            if (endDate.isBefore(startDate)) {
                throw new Error ("End date must be greated than start date.")
            }      

            while (startDate.isSameOrBefore(endDate)) {
                arrMonth.push(startDate.format("YYYY-MM-DD"));
                startDate.add(1, 'month');
            }

            const xAxis = arrMonth.map(el => moment(el).format('MMM YYYY'))
            console.log('xxx', xAxis);

            const pit = (
                await MasPit.query().where( w => {
                    w.where('sts', 'Y')
                    w.where('site_id', req.site_id)
                }).fetch()
            ).toJSON()

            for (const val of pit) {
                for (const elm of arrMonth) {

                    const sumOB = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                        w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                    }).getSum('ob') || 0

                    const sumCoal = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                        w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                    }).getSum('coal_bcm') || 0

                    const sumFuel = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                        w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                    }).getSum('fuel_used') || 0

                    result.push({
                        name: val.name,
                        cumProduction: sumOB + sumCoal,
                        cumFuelUsed: sumFuel,
                        data: (sumOB + sumCoal) / sumFuel || 0
                    });
                }
            }

            /* CUMMULATIVE MONTHLY DATA */
            let cummMonth = []
            for (const elm of arrMonth) {
                const sumCummOB = await MamFuelRatio.query().where( w => {
                    w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                    w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                }).getSum('ob') || 0
    
                const sumCummCoal = await MamFuelRatio.query().where( w => {
                    w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                    w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                }).getSum('coal_bcm') || 0
    
                const sumCummFuel = await MamFuelRatio.query().where( w => {
                    w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                    w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                }).getSum('fuel_used') || 0

                cummMonth.push({
                    cumProduction: sumCummOB + sumCummCoal,
                    cumFuelUsed: sumCummFuel,
                    data: (sumCummOB + sumCummCoal) / sumCummFuel || 0
                });
            }

            cumm = [
                
                {
                    name: 'Cumm Fuel Used',
                    type: req.typeChart,
                    color: color[0],
                    data: cummMonth.map(el => el.cumFuelUsed),
                    dataLabels: {
                        enabled: true,
                        y: 5,
                        format: '{point.y:.2f}'
                    }
                },
                {
                    name: 'Cumm Production',
                    type: req.typeChart,
                    yAxis: 0,
                    color: color[1],
                    data: cummMonth.map(el => parseFloat((el.cumProduction).toFixed('2'))),
                    dataLabels: {
                        enabled: true,
                        y: -15,
                        format: '{point.y:.2f}'
                    }
                },
                {
                    name: 'Cumm Fuel Ratio',
                    type: 'spline',
                    color: 'red',
                    yAxis: 1,
                    data: cummMonth.map(el => parseFloat((el.data).toFixed('2'))),
                    dataLabels: {
                        enabled: true,
                        y: 5,
                        format: '{point.y:.2f}'
                    }
                }
            ]

            console.log(cumm);
            // let color = req.colorGraph
            result = _.groupBy(result, 'name')
            result = Object.keys(result).map((key, i) => {
                return {
                    name: key,
                    stack: key,
                    type: req.typeChart,
                    color: color[i] || 'red',
                    data: result[key].map( el => parseFloat((el.data).toFixed(2))),
                    dataLabels: {
                        enabled: true,
                        align: 'top',
                        format: '{point.y:.2f}', // one decimal
                        style: {
                            fontSize: '11px',
                            fontFamily: 'sans-serif',
                        }
                    },
                    pointPadding: 0.1,
                    groupPadding: 0
                }
            })
            
            return {
                site: site,
                xAxis: xAxis,
                series: result,
                cummxAxis: xAxis,
                cummSeries: cumm
            }
        }
    }

    async PIT_WISE_LIST (req) {
        console.log('<BY PIT FUEL RATIO>');
        let data = []
        let color = req.colorGraph
        const site = await MasSite.query().where('id', req.site_id).last()
        const pit = await MasPit.query().where('id', req.pit_id).last()
        
        console.log(req);
        /* CARI JARAK RATA-RATA */
        const avgDistance = await DailyRitase.query().where( w => {
            w.where('pit_id', req.pit_id)
            if(req.inp_ranges == 'WEEKLY'){
                w.where('date', '>=', moment(req.start).startOf('week').format('YYYY-MM-DD'))
                w.where('date', '<=', moment(req.end).endOf('week').format('YYYY-MM-DD'))
            }else{
                w.where('date', '>=', req.start)
                w.where('date', '<=', req.end)
            }
        }).getAvg('distance')

        const { ratio } = await DB.from('mam_fuel_ratios_config').where( w => {
            w.where('distances', '>=', avgDistance)
            w.where('distances', '<=', (avgDistance + 200))
        }).last()

        if(req.inp_ranges == 'MONTHLY'){ //monthly
            data = (
                await MamFuelRatio.query().where(w => {
                    w.where('pit_id', req.pit_id)
                    w.where('date', '>=', req.start)
                    w.where('date', '<=', req.end)
                }).fetch()
            ).toJSON()

            data = data.map(val => {
                return {
                    ...val,
                    bulan: moment(val.date).format('MMM YY')
                }
            })

            data = _.groupBy(data, 'bulan')
            data = Object.keys(data).map(key => {
                var ratio_act = data[key].reduce((a, b) => { return a + b.fuel_ratio }, 0) / data[key].length
                var diff = ratio_act - ratio
                return {
                    periode: key,
                    location: pit.kode,
                    target: ratio,
                    actual: ratio_act,
                    diff: diff,
                    status: diff < 0 ? 'low target':'over target',
                    items: data[key]

                }
            })
        }

        if(req.inp_ranges == 'WEEKLY'){ //weekly
            let arrDate = []
            var x = moment(req.start).week()
            var y = moment(req.end).week()
            for (let i = x - 1; i < y; i++) {
                var str = '-W'+'0'.repeat(2 - `${i}`.length) + i
                var arrStart = moment(moment(req.start).format('YYYY') + str).startOf('week').add(1, 'day')
                var arrEnd = moment(moment(req.end).format('YYYY') + str).endOf('week').add(1, 'day')
    
                var getDaysBetweenDates = function(startDate, endDate) {
                    var now = startDate.clone(), dates = [];
              
                    while (now.isSameOrBefore(endDate)) {
                        dates.push(now.format('YYYY-MM-DD'));
                        now.add(1, 'days');
                    }
                    return dates;
                };
    
                var arrTgl = getDaysBetweenDates(arrStart, arrEnd)
                arrDate.push({
                    date: 'week-'+i,
                    site_id: req.site_id,
                    items: arrTgl
                })
            }
            // console.log(arrDate);

            for (const obj of arrDate) {
                const ratio_act = 
                    await MamFuelRatio.query().where(w => {
                        w.where('pit_id', req.pit_id)
                        w.where('date', '>=', _.first(obj.items))
                        w.where('date', '<=', _.last(obj.items))
                    }).getAvg('fuel_ratio')
                var diff = ratio_act - ratio
                data.push({
                    periode: obj.date,
                    location: pit.kode,
                    target: ratio,
                    actual: ratio_act,
                    diff: diff,
                    status: diff < 0 ? 'low target':'over target'
                })
            }
        }

        if(req.inp_ranges == 'DAILY'){ //daily
            try {
                const dataDaily = (
                    await MamFuelRatio.query().where(w => {
                        w.where('pit_id', req.pit_id)
                        w.where('date', '>=', req.start)
                        w.where('date', '<=', req.end)
                    }).fetch()
                ).toJSON()
    
                data = dataDaily.map(val => {
                    var diff = val.fuel_ratio - ratio
                    return {
                        periode: moment(val.date).format('DD/MM/YY'),
                        location: pit.kode,
                        target: ratio,
                        actual: val.fuel_ratio,
                        diff: diff,
                        status: diff < 0 ? 'low target':'over target'
                    }
                })
                
            } catch (error) {
                console.log(error);
                throw new Error(error)
            }
        }

        return data
    }

    async PERIODE_WISE_LIST (req) {
        let data = []
        let color = req.colorGraph
        const site = await MasSite.query().where('id', req.site_id).last()

        console.log(req);

        if(req.inp_ranges == 'MONTHLY'){ //monthly
            var start = moment(req.start).month()
            var end = moment(req.end).month()
            for (let i = start; i <= end; i++) {
                var awal = moment().month(i).startOf('month').format('DD-MM-YYYY')
                var akhir = moment().month(i).endOf('month').format('DD-MM-YYYY')
                const pitArr = (await MasPit.query().where('sts', 'Y').fetch()).toJSON()

                for (const [i, pit] of pitArr.entries()) {
                    /* CARI JARAK RATA-RATA */
                    const avgDistance = await DailyRitase.query().where( w => {
                        w.where('site_id', req.site_id)
                        w.where('pit_id', pit.id)
                        if(req.inp_ranges === 'week'){
                            w.where('date', '>=', moment(req.start).startOf('week').format('YYYY-MM-DD'))
                            w.where('date', '<=', moment(req.end).endOf('week').format('YYYY-MM-DD'))
                        }else{
                            w.where('date', '>=', awal)
                            w.where('date', '<=', akhir)
                        }
                    }).getAvg('distance')

                    const { ratio } = await DB.from('mam_fuel_ratios_config').where( w => {
                        w.where('distances', '>=', avgDistance)
                        w.where('distances', '<=', (avgDistance + 200))
                    }).last()

                    let actualRatio = 
                        await MamFuelRatio.query().where(w => {
                            w.where('site_id', req.site_id)
                            w.where('pit_id', pit.id)
                            w.where('date', '>=', awal)
                            w.where('date', '<=', akhir)
                        }).getAvg('fuel_ratio')

                    var diff = actualRatio - ratio
                    data.push({
                        periode: moment().month(i).format('MM/YY'),
                        location: pit.kode,
                        actual: actualRatio,
                        target: ratio,
                        diff: diff,
                        status: diff < 0 ? 'low target':'over target',
                        color: color[i]
                    })
                }
            }
            data = _.sortBy( data, 'location' );
            return data
            
        }

        if(req.inp_ranges == 'WEEKLY'){ //weekly
            let arrDate = []
            var x = moment(req.start).week()
            var y = moment(req.end).week()
            for (let i = x - 1; i < y; i++) {
                var str = '-W'+'0'.repeat(2 - `${i}`.length) + i
                var arrStart = moment(moment(req.start).format('YYYY') + str).startOf('week').add(1, 'day')
                var arrEnd = moment(moment(req.end).format('YYYY') + str).endOf('week').add(1, 'day')
    
                var getDaysBetweenDates = function(startDate, endDate) {
                    var now = startDate.clone(), dates = [];
              
                    while (now.isSameOrBefore(endDate)) {
                        dates.push(now.format('YYYY-MM-DD'));
                        now.add(1, 'days');
                    }
                    return dates;
                };
    
                var arrTgl = getDaysBetweenDates(arrStart, arrEnd)
                arrDate.push({
                    date: 'week-'+i,
                    items: arrTgl
                })
            }

            const pitArr = (await MasPit.query().where('sts', 'Y').fetch()).toJSON()
            for (const [i, pit] of pitArr.entries()) {

                for (const obj of arrDate) {
                    const avgDistance = await DailyRitase.query().where( w => {
                        w.where('site_id', req.site_id)
                        w.where('pit_id', pit.id)
                        if(req.inp_ranges === 'week'){
                            w.where('date', '>=', _.first(obj.items))
                            w.where('date', '<=', _.last(obj.items))
                        }else{
                            w.where('date', '>=', _.first(obj.items))
                            w.where('date', '<=', _.last(obj.items))
                        }
                    }).getAvg('distance')
    
                    const { ratio } = await DB.from('mam_fuel_ratios_config').where( w => {
                        w.where('distances', '>=', avgDistance)
                        w.where('distances', '<=', (avgDistance + 200))
                    }).last()
                    

                    let actualRatio = 
                        await MamFuelRatio.query().where(w => {
                            w.where('site_id', req.site_id)
                            w.where('pit_id', pit.id)
                            w.where('date', '>=', _.first(obj.items))
                            w.where('date', '<=', _.last(obj.items))
                        }).getAvg('fuel_ratio')

                    var diff = actualRatio - ratio
                    data.push({
                        periode: obj.date,
                        location: pit.kode,
                        actual: actualRatio,
                        target: ratio,
                        diff: diff,
                        status: diff < 0 ? 'low target':'over target',
                        color: color[i]
                    })
                }
            }

            return data
        }

        if(req.inp_ranges == 'DAILY'){ //daily
            
            const pitArr = (await MasPit.query().where('sts', 'Y').fetch()).toJSON()
            for (const [i, pit] of pitArr.entries()) {
                let arrRatio = (
                    await MamFuelRatio.query().where(w => {
                        w.where('site_id', req.site_id)
                        w.where('pit_id', pit.id)
                        w.where('date', '>=', req.start)
                        w.where('date', '<=', req.end)
                    }).fetch()
                ).toJSON()
                
                for (const obj of arrRatio) {
                    let avgDistance

                    try {
                        avgDistance = await DailyRitase.query().where( w => {
                            w.where('site_id', req.site_id)
                            w.where('pit_id', pit.id)
                            w.where('date', obj.date)
                        }).getAvg('distance')

                        
                    } catch (error) {
                        console.log('DISTANCE :::', error);
                    }
                    
                    let budgetRatio
                    try {
                        budgetRatio = await DB.from('mam_fuel_ratios_config').where( w => {
                            w.where('distances', '>=', avgDistance)
                            w.where('distances', '<=', (avgDistance + 200))
                        }).last()
                    } catch (error) {
                        console.log('RATIO :::', error);
                    }
                    
                    var diff = obj.fuel_ratio - (budgetRatio?.ratio || 0)
                    if(avgDistance && budgetRatio){
                        data.push({
                            periode: obj.date,
                            location: pit.kode,
                            actual: obj.fuel_ratio,
                            target: budgetRatio?.ratio || 0,
                            diff: diff,
                            status: diff < 0 ? 'low target':'over target',
                            color: color[i]
                        })

                    }
                }
            }
            
            return data
        }

    }
}
module.exports = new repFuelRatio()
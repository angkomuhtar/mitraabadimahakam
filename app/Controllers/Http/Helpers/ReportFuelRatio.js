'use strict'

const moment = require("moment")
const _ = require('underscore')
const MamFuelRatio = use("App/Models/MamFuelRatio")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")

class repFuelRatio {
    async PIT_WISE (req) {
        /* GET DATA FUEL RATIO */
        let result = []

        const data = (
            await MamFuelRatio.query().where( w => {
                w.where('site_id', req.site_id)
                w.where('pit_id', req.pit_id)
                w.where('date', '>=', req.start)
                w.where('date', '<=', req.end)
            }).fetch()
        ).toJSON()

        const xAxis = data.map(el => moment(el.date).format('DD MMM YYYY'))
        result.push({
            name: 'Fuel Ratio',
            type: req.typeChart,
            color: '#015CB1',
            data: data.map(el => el.fuel_ratio),
            dataLabels: {
                enabled: true,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                format: '{point.y:.2f}', // one decimal
                y: 0, // 10 pixels down from the top
                style: {
                    fontSize: '11px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        })

        result.push({
            name: 'Budget',
            type: 'spline',
            color: 'red',
            data: data.map(el => 0.85)
        })

        return {
            xAxis: xAxis,
            series: result
        }
    }

    async PERIODE_WISE (req) {
        let result = []
        /* GET DATA FUEL RATIO */
        if(req.inp_ranges === 'date'){
            let data = (
                await MamFuelRatio.query().where( w => {
                    w.where('site_id', req.site_id)
                    w.where('date', '>=', req.start)
                    w.where('date', '<=', req.end)
                }).fetch()
            ).toJSON()

            data = _.groupBy(data, 'date')
            data = Object.keys(data).map(key => {
                return {
                    date: moment(key).format('YYYY-MM-DD'),
                    items: data[key].map(el => {
                        return {
                            pit_id: el.pit_id,
                            fuel_ratio: el.fuel_ratio
                        }
                    })
                }
            })

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

            let color = ['#75A5E3', '#1873C8', '#014584']
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
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.2f}', // one decimal
                        y: 0, // 10 pixels down from the top
                        style: {
                            fontSize: '11px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                }
            })
            result = [...result, ...res]
            result.push({
                name: 'budget',
                type: 'spline',
                color: 'red',
                data: data.map(el => 0.85),
                
            })
            return {
                xAxis: xAxis,
                series: result
            }
        }

        if(req.inp_ranges === 'week'){
            console.log('WEEKLY ....');

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
                    date: 'WEEK-'+i,
                    site_id: req.site_id,
                    items: arrTgl
                })
            }

            let xAxis = arrDate.map(el => el.date)
            console.log(arrDate);
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
                    }).getSum('ob')

                    const sumCoal = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('coal_bcm')

                    const sumFuel = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('fuel_used')

                    result.push({
                        name: val.name,
                        data: (sumOB + sumCoal) / sumFuel
                    });
                }
            }

            let color = ['#75A5E3', '#1873C8', '#014584']
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
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.2f}', // one decimal
                        y: 0, // 10 pixels down from the top
                        style: {
                            fontSize: '11px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                }
            })
            
            let budget = [{
                name: 'budget',
                type: 'spline',
                color: 'red',
                data: xAxis.map(el => 0.85),
                
            }]

            return {
                xAxis: xAxis,
                series: [...result, ...budget]
            }
        }

        if(req.inp_ranges === 'month'){
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
                        data: (sumOB + sumCoal) / sumFuel || 0
                    });
                }
            }
            
            let color = ['#75A5E3', '#1873C8', '#014584']
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
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.2f}', // one decimal
                        y: 0, // 10 pixels down from the top
                        style: {
                            fontSize: '11px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                }
            })
            
            let budget = [{
                name: 'budget',
                type: 'spline',
                color: 'red',
                data: xAxis.map(el => 0.85),
                
            }]
            console.log(result);
            return {
                xAxis: xAxis,
                series: [...result, ...budget]
            }
        }
    }
}
module.exports = new repFuelRatio()
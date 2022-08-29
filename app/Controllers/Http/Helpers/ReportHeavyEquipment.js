'use strict'

const _ = require('underscore')
const moment = require("moment")
const MasSite = use("App/Models/MasSite")
const MasEquipment = use("App/Models/MasEquipment")
const DailyDowntimeEquipment = use("App/Models/DailyDowntimeEquipment")
const MamEquipmentPerformance = use("App/Models/MamEquipmentPerformance")
const MamEquipmentPerformanceDetails = use("App/Models/MamEquipmentPerformanceDetails")

class repHeavyEquipment {
    async DAILY(req){

        console.log('====================================');
        console.log(req);
        console.log('====================================');

        let color = ['#75A5E3', '#1873C8', '#014584']

        const dataEquipment = (
            await MasEquipment.query().where( w => {
                w.where('unit_model', req.unit_model)
            }).select('id').fetch()
        ).toJSON()

        // console.log(dataEquipment.map(el => el.id));

        let arrEquipment = dataEquipment.map(el => el.id)
        
        let data = []
        try {
            data = (
                await MamEquipmentPerformanceDetails.query()
                .whereIn('equip_id', dataEquipment.map(el => el.id))
                .andWhere( w => {
                    w.where('date', '>=', req.start_date)
                    w.where('date', '<=', req.end_date)
                    if(req.site_id){
                        w.where('site_id', req.site_id)
                    }
                })
                .fetch()
            ).toJSON()
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed generate data '+ error
            }
        }

        /* GENERATE DATA KPI */
        let dataGroupModel = _.groupBy(data, 'date')
        dataGroupModel = Object.keys(dataGroupModel).map(key => {
            return {
                date: moment(new Date(key)).format('DD/MM/YY'),
                actPA: (dataGroupModel[key].reduce((x, y) => {
                    return x + y.actual_pa
                }, 0)) / dataGroupModel[key].length,
                budgetPA: (dataGroupModel[key].reduce((x, y) => {
                    return x + y.budget_pa
                }, 0)) / dataGroupModel[key].length,
                actMTBS: (dataGroupModel[key].reduce((x, y) => {
                    return x + y.actual_mtbs
                }, 0)) / dataGroupModel[key].length,
                budgetMTBS: (dataGroupModel[key].reduce((x, y) => {
                    return x + y.target_mtbs
                }, 0)) / dataGroupModel[key].length,
                actMTTR: (dataGroupModel[key].reduce((x, y) => {
                    return x + y.actual_mttr
                }, 0)) / dataGroupModel[key].length,
                budgetMTTR: (dataGroupModel[key].reduce((x, y) => {
                    return x + y.target_mttr
                }, 0)) / dataGroupModel[key].length,
                items: dataGroupModel[key]
            }
        })


        dataGroupModel = _.sortBy(dataGroupModel, 'date')
        const xAxis = dataGroupModel.map( el => el.date)
        // console.log(xAxis);
        const series = dataGroupModel.map( obj => {
            return {
                ...obj,
                AVG_PA: ((dataGroupModel.reduce((x, y) => { return x + y.actPA}, 0)) / dataGroupModel.length)?.toFixed(2),
                AVG_MTBS: ((dataGroupModel.reduce((x, y) => { return x + y.actMTBS}, 0)) / dataGroupModel.length)?.toFixed(2),
                AVG_MTTR: ((dataGroupModel.reduce((x, y) => { return x + y.actMTTR}, 0)) / dataGroupModel.length)?.toFixed(2)
            }
        })

        /* GENERATE DATA BREAKDOWN RATIO */
        const unitDowntime = (
            await DailyDowntimeEquipment.query().with('equipment').where( w => {
                w.where('breakdown_start', '>=', req.start_date)
                w.where('breakdown_start', '<=', req.end_date)
                w.where('site_id', req.site_id)
                w.whereIn('equip_id', arrEquipment)
            }).fetch()
        ).toJSON()

        let grandTotal = unitDowntime.reduce((a, b) => { return a + b.downtime_total }, 0)


        let unitDowntimeGroup = _.groupBy(unitDowntime, 'downtime_status')
        unitDowntimeGroup = Object.keys(unitDowntimeGroup).map( key => {
            var kode
            switch (key) {
                case 'UNS':
                    kode = 'UnScheduled'
                    break;
                case 'SCH':
                    kode = 'Scheduled'
                    break;
                case 'ACD':
                    kode = 'Accident'
                    break;
                default:
                    kode = 'Others'
                    break;
            }
            return {
                name: kode,
                persen: ((unitDowntimeGroup[key].reduce((a, b) => { return a + b.downtime_total }, 0)) / grandTotal) * 100,
                totDowntime: unitDowntimeGroup[key].reduce((a, b) => { return a + b.downtime_total }, 0),
                items: unitDowntimeGroup[key]
            }
        })

        let downtimeRatio = []
        for (const obj of unitDowntimeGroup) {
            downtimeRatio.push([obj.name, obj.persen])
        }

        
        /* GENERATE DATA TOP 10 BY DURATION */
        let downtimeType = _.groupBy(unitDowntime, 'component_group')
        downtimeType = Object.keys(downtimeType).map(key => {
            return {
                name: key,
                tot_duration: downtimeType[key].reduce((a, b) => { return a + parseFloat(b.downtime_total) }, 0),
                items: downtimeType[key]
            }
        })

        // Sorting and Limit 10
        downtimeType = downtimeType.sort((a,b) => b.tot_duration - a.tot_duration).slice(0, 10)

        const xAxisDuration = downtimeType.map(obj => obj.name)
        const seriesDuration = [
            {
                name: 'Duration By Hours', 
                color: `rgba(238, 143, 5, 0.7)`,
                data: downtimeType.map(obj => obj.tot_duration)
            }
        ]

        /* GENERATE DATA TOP 10 BY EVENT */
        let downtimeCount = _.groupBy(unitDowntime, 'component_group')
        downtimeCount = Object.keys(downtimeCount).map(key => {
            return {
                name: key,
                len_duration: downtimeCount[key].length,
                items: downtimeCount[key]
            }
        })

        const xAxisEvent = downtimeCount.map(obj => obj.name)
        const seriesEvent = [
            {
                name: 'Duration By Hours', 
                color: `rgba(238, 143, 5, 0.7)`,
                data: downtimeCount.map(obj => obj.len_duration)
            }
        ]
        
        return {
            success: true,
            byKPI: {
                dataTable: series,
                xAxis: xAxis,
                series: [
                    {
                        name: 'MTBS', 
                        type: 'spline',
                        color: 'red',
                        data: series.map(obj => obj.actMTBS)
                    },
                    {
                        name: 'MTTR', 
                        type: 'spline',
                        color: '#ddd',
                        data: series.map(obj => obj.actMTTR)
                    },
                    {
                        name: 'Actual PA', 
                        type: req.typeChart,
                        states: {hover: {enabled: false}},
                        color: color[2] || 'red',
                        data: series.map(obj => obj.actPA)
                    },
                    {
                        name: 'Plan PA', 
                        type: req.typeChart,
                        states: {hover: {enabled: false}},
                        color: color[0] || 'red',
                        data: series.map(obj => obj.budgetPA)
                    }
                ]
            },
            byRatio: [{
                type: 'pie',
                name: 'Breakdown Ratio',
                data: downtimeRatio
            }],
            byDataRatio: unitDowntimeGroup,
            dataEvent: unitDowntime,
            byDuration: {
                xAxis: xAxisDuration,
                series: seriesDuration
            },
            byEvents: {
                xAxis: xAxisEvent,
                series: seriesEvent
            }
        }
    }

    async WEEKLY(req){
        console.log('====================================');
        console.log(req);
        console.log('====================================');

        let color = ['#75A5E3', '#1873C8', '#014584']

        const dataEquipment = (
            await MasEquipment.query().where( w => {
                w.where('unit_model', req.unit_model)
            }).select('id').fetch()
        ).toJSON()

        // console.log(dataEquipment.map(el => el.id));

        let arrEquipment = dataEquipment.map(el => el.id)

        let arrDate = []
        var x = moment(req.start_week).week()
        var y = moment(req.end_week).week()
        for (let i = x - 1; i < y; i++) {
            var str = '-W'+'0'.repeat(2 - `${i}`.length) + i
            var arrStart = moment(moment(req.start_week).format('YYYY') + str).startOf('week').add(1, 'day')
            var arrEnd = moment(moment(req.end_week).format('YYYY') + str).endOf('week').add(1, 'day')

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

        let data = []
        for (let obj of arrDate) {
            try {
                const mamEquipmentPerformanceDetails = (
                    await MamEquipmentPerformanceDetails.query()
                    .whereIn('equip_id', dataEquipment.map(el => el.id))
                    .andWhere( w => {
                        w.where('date', '>=', _.first(obj.items))
                        w.where('date', '<=', _.last(obj.items))
                        w.where('site_id', req.site_id)
                    })
                    .fetch()
                ).toJSON()
                // data.push(mamEquipmentPerformanceDetails)
                obj = {
                    ...obj, 
                    unit_model: req.unit_model,
                    site_id: req.site_id,
                    mohh_weekly: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.mohh}, 0),
                    budgetPA: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.budget_pa}, 0)/7,
                    actPA: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_pa}, 0)/7,
                    targetMTBS: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.target_mtbs}, 0)/7,
                    actMTBS: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_mtbs}, 0)/7,
                    targetMTTR: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.target_mttr}, 0)/7,
                    actMTTR: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_mttr}, 0)/7,
                    actual_ua: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_ua}, 0)/7,
                    actual_ma: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_ma}, 0)/7,
                    actual_eu: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_eu}, 0)/7,
                    work_hours: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.work_hours}, 0)/7,
                    standby_hours: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.standby_hours}, 0)/7,
                    breakdown_hours_scheduled: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_hours_scheduled}, 0)/7,
                    breakdown_ratio_scheduled: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_ratio_scheduled}, 0)/7,
                    breakdown_hours_unscheduled: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_hours_unscheduled}, 0)/7,
                    breakdown_ratio_unscheduled: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_ratio_unscheduled}, 0)/7,
                    breakdown_hours_accident: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_hours_accident}, 0)/7,
                    breakdown_hours_total: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_hours_total}, 0)/7,
                    data: mamEquipmentPerformanceDetails.map(obj => {
                        return {
                            unit_model: req.unit_model,
                            site_id: req.site_id,
                            mohh_weekly: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.mohh}, 0),
                            budgetPA: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.budget_pa}, 0)/7,
                            actPA: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_pa}, 0)/7,
                            targetMTBS: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.target_mtbs}, 0)/7,
                            actMTBS: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_mtbs}, 0)/7,
                            targetMTTR: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.target_mttr}, 0)/7,
                            actMTTR: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_mttr}, 0)/7,
                            actual_ua: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_ua}, 0)/7,
                            actual_ma: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_ma}, 0)/7,
                            actual_eu: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.actual_eu}, 0)/7,
                            work_hours: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.work_hours}, 0)/7,
                            standby_hours: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.standby_hours}, 0)/7,
                            breakdown_hours_scheduled: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_hours_scheduled}, 0)/7,
                            breakdown_ratio_scheduled: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_ratio_scheduled}, 0)/7,
                            breakdown_hours_unscheduled: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_hours_unscheduled}, 0)/7,
                            breakdown_ratio_unscheduled: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_ratio_unscheduled}, 0)/7,
                            breakdown_hours_accident: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_hours_accident}, 0)/7,
                            breakdown_hours_total: mamEquipmentPerformanceDetails.reduce((a, b) => { return a + b.breakdown_hours_total}, 0)/7,
                        }
                    })
                }
                data.push(obj)
            } catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: 'Failed generate data '+ error
                }
            }
        }

        const series = data.map( obj => {
            return {
                ...obj,
                AVG_PA: ((obj.data.reduce((x, y) => { return x + y.actPA}, 0)) / obj.data.length)?.toFixed(2),
                AVG_MTBS: ((obj.data.reduce((x, y) => { return x + y.actMTBS}, 0)) / obj.data.length)?.toFixed(2),
                AVG_MTTR: ((obj.data.reduce((x, y) => { return x + y.actMTTR}, 0)) / obj.data.length)?.toFixed(2)
            }
        })

        /* GENERATE DATA BREAKDOWN RATIO */
        const unitDowntime = (
            await DailyDowntimeEquipment.query().with('equipment').where( w => {
                w.where('breakdown_start', '>=', moment(req.start_week).format('YYYY-MM-DD'))
                w.where('breakdown_start', '<=', moment(req.end_week).format('YYYY-MM-DD'))
                w.where('site_id', req.site_id)
                w.whereIn('equip_id', arrEquipment)
            }).fetch()
        ).toJSON()

        let grandTotal = unitDowntime.reduce((a, b) => { return a + b.downtime_total }, 0)


        let unitDowntimeGroup = _.groupBy(unitDowntime, 'downtime_status')
        unitDowntimeGroup = Object.keys(unitDowntimeGroup).map( key => {
            var kode
            if(key === 'UNS'){
                kode = 'UnScheduled'
            }
            if(key === 'SCH'){
                kode = 'Scheduled'
            }
            if(key === 'ACD'){
                kode = 'Accident'
            }
            return {
                name: kode,
                persen: ((unitDowntimeGroup[key].reduce((a, b) => { return a + b.downtime_total }, 0)) / grandTotal) * 100,
                totDowntime: unitDowntimeGroup[key].reduce((a, b) => { return a + b.downtime_total }, 0),
                items: unitDowntimeGroup[key]
            }
        })

        let downtimeRatio = []
        for (const obj of unitDowntimeGroup) {
            downtimeRatio.push([obj.name, parseFloat((obj.persen).toFixed(2))])
        }

        /* GENERATE DATA TOP 10 BY DURATION */
        let downtimeType = _.groupBy(unitDowntime, 'component_group')
        downtimeType = Object.keys(downtimeType).map(key => {
            return {
                name: key,
                tot_duration: downtimeType[key].reduce((a, b) => { return a + parseFloat(b.downtime_total) }, 0),
                items: downtimeType[key]
            }
        })

        // Sorting and Limit 10
        downtimeType = downtimeType.sort((a,b) => b.tot_duration - a.tot_duration).slice(0, 10)

        const xAxisDuration = downtimeType.map(obj => obj.name)
        const seriesDuration = [
            {
                name: 'Duration By Hours', 
                color: `rgba(238, 143, 5, 0.7)`,
                data: downtimeType.map(obj => obj.tot_duration)
            }
        ]

        /* GENERATE DATA TOP 10 BY EVENT */
        let downtimeCount = _.groupBy(unitDowntime, 'component_group')
        downtimeCount = Object.keys(downtimeCount).map(key => {
            return {
                name: key,
                len_duration: downtimeCount[key].length,
                items: downtimeCount[key]
            }
        })

        const xAxisEvent = downtimeCount.map(obj => obj.name)
        const seriesEvent = [
            {
                name: 'Duration By Hours', 
                color: `rgba(238, 143, 5, 0.7)`,
                data: downtimeCount.map(obj => obj.len_duration)
            }
        ]
        
        return {
            success: true,
            byKPI: {
                dataTable: series,
                xAxis: data.map(obj => obj.date),
                series: [
                    {
                        name: 'MTBS', 
                        type: 'spline',
                        color: 'red',
                        data: series.map(obj => obj.actMTBS)
                    },
                    {
                        name: 'MTTR', 
                        type: 'spline',
                        color: '#ddd',
                        data: series.map(obj => obj.actMTTR)
                    },
                    {
                        name: 'Actual PA', 
                        type: req.typeChart,
                        states: {hover: {enabled: false}},
                        color: color[2] || 'red',
                        data: series.map(obj => obj.actPA)
                    },
                    {
                        name: 'Plan PA', 
                        type: req.typeChart,
                        states: {hover: {enabled: false}},
                        color: color[0] || 'red',
                        data: series.map(obj => obj.budgetPA)
                    }
                ]
            },
            byRatio: [{
                type: 'pie',
                name: 'Breakdown Ratio',
                data: downtimeRatio
            }],
            byDataRatio: unitDowntimeGroup,
            dataEvent: unitDowntime,
            byDuration: {
                xAxis: xAxisDuration,
                series: seriesDuration
            },
            byEvents: {
                xAxis: xAxisEvent,
                series: seriesEvent
            }
        }
    }

    async MONTHLY(req){
        console.log('====================================');
        console.log(req);
        console.log('====================================');

        let color = ['#75A5E3', '#1873C8', '#014584']

        const dataEquipment = (
            await MasEquipment.query().where( w => {
                w.where('unit_model', req.unit_model)
            }).select('id').fetch()
        ).toJSON()

        // console.log(dataEquipment.map(el => el.id));

        let arrEquipment = dataEquipment.map(el => el.id)
        

        let data = []
        try {
            data = (
                await MamEquipmentPerformanceDetails.query()
                .whereIn('equip_id', dataEquipment.map(el => el.id))
                .andWhere( w => {
                    w.where('date', '>=', moment(req.start_month).startOf('month').format('YYYY-MM-DD'))
                    w.where('date', '<=', moment(req.end_month).endOf('month').format('YYYY-MM-DD'))
                    w.where('site_id', req.site_id)
                })
                .fetch()
            ).toJSON()
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed generate data '+ error
            }
        }

        let getMonth = (new Date(req.end_month)).getMonth() + 1
        let arrMonth = Array.apply(0, Array(getMonth)).map(function(_,i){return moment().month(i).format('MM/YY')})

        data =  data.map(obj => {
            return {
                ...obj,
                date: moment(obj.date).format('MM/YY')
            }
        })

        for (let i = 0; i < arrMonth.length; i++) {
            if(data[i].date != arrMonth[i]){
                data.push({
                    date: arrMonth[i],
                    target_downtime_monthly: 0,
                    items: []
                })
            }
        }

        data = _.groupBy(_.sortBy(data, 'date'), 'date')
        data = Object.keys(data).map(key => {
            var a = moment(key).startOf('month')//now
            var b = moment(key).endOf('month')
            return {
                date: key,
                target_downtime_monthly: b.diff(a, 'hours'),
                items: data[key]
            }
        })


        let result = []
        for (let obj of data) {
            obj = {
                ...obj, 
                mohh_monthly: obj.target_downtime_monthly,
                budgetPA: obj.items.reduce((a, b) => { return a + b.budget_pa}, 0)/obj.items.length,
                actPA: obj.items.reduce((a, b) => { return a + b.actual_pa}, 0)/obj.items.length,
                targetMTBS: obj.items.reduce((a, b) => { return a + b.target_mtbs}, 0)/obj.items.length,
                actMTBS: obj.items.reduce((a, b) => { return a + b.actual_mtbs}, 0)/obj.items.length,
                targetMTTR: obj.items.reduce((a, b) => { return a + b.target_mttr}, 0)/obj.items.length,
                actMTTR: obj.items.reduce((a, b) => { return a + b.actual_mttr}, 0)/obj.items.length,
                actual_ua: obj.items.reduce((a, b) => { return a + b.actual_ua}, 0)/obj.items.length,
                actual_ma: obj.items.reduce((a, b) => { return a + b.actual_ma}, 0)/obj.items.length,
                actual_eu: obj.items.reduce((a, b) => { return a + b.actual_eu}, 0)/obj.items.length,
                work_hours: obj.items.reduce((a, b) => { return a + b.work_hours}, 0)/obj.items.length,
                standby_hours: obj.items.reduce((a, b) => { return a + b.standby_hours}, 0)/obj.items.length,
                breakdown_hours_scheduled: obj.items.reduce((a, b) => { return a + b.breakdown_hours_scheduled}, 0)/obj.items.length,
                breakdown_ratio_scheduled: obj.items.reduce((a, b) => { return a + b.breakdown_ratio_scheduled}, 0)/obj.items.length,
                breakdown_hours_unscheduled: obj.items.reduce((a, b) => { return a + b.breakdown_hours_unscheduled}, 0)/obj.items.length,
                breakdown_ratio_unscheduled: obj.items.reduce((a, b) => { return a + b.breakdown_ratio_unscheduled}, 0)/obj.items.length,
                breakdown_hours_accident: obj.items.reduce((a, b) => { return a + b.breakdown_hours_accident}, 0)/obj.items.length,
                breakdown_hours_total: obj.items.reduce((a, b) => { return a + b.breakdown_hours_total}, 0)/obj.items.length,
                
            }

            result.push(obj)
        }
        

        const series = result.map( obj => {
            return {
                ...obj,
                actPA: parseFloat((obj.actPA).toFixed(2)),
                targetMTBS: parseFloat((obj.targetMTBS).toFixed(2)),
                actMTBS: parseFloat((obj.actMTBS).toFixed(2)),
                targetMTTR: parseFloat((obj.targetMTTR).toFixed(2)),
                actMTTR: parseFloat((obj.actMTTR).toFixed(2)),
                actual_ua: parseFloat((obj.actual_ua).toFixed(2)),
                actual_ma: parseFloat((obj.actual_ma).toFixed(2)),
                standby_hours: parseFloat((obj.standby_hours).toFixed(2)),
                breakdown_hours_scheduled: parseFloat((obj.breakdown_hours_scheduled).toFixed(2)),
                breakdown_ratio_scheduled: parseFloat((obj.breakdown_ratio_scheduled).toFixed(2)),
                breakdown_ratio_unscheduled: parseFloat((obj.breakdown_ratio_unscheduled).toFixed(2)),
                breakdown_hours_total: parseFloat((obj.breakdown_hours_total).toFixed(2))
            }
        })
        // console.log(series);

        /* GENERATE DATA BREAKDOWN RATIO */
        const unitDowntime = (
            await DailyDowntimeEquipment.query().with('equipment').where( w => {
                w.where('breakdown_start', '>=', moment(req.start_month).startOf('month').format('YYYY-MM-DD'))
                w.where('breakdown_start', '<=', moment(req.end_month).startOf('month').format('YYYY-MM-DD'))
                w.where('site_id', req.site_id)
                w.whereIn('equip_id', arrEquipment)
            }).fetch()
        ).toJSON()

        let grandTotal = unitDowntime.reduce((a, b) => { return a + b.downtime_total }, 0)


        let unitDowntimeGroup = _.groupBy(unitDowntime, 'downtime_status')
        unitDowntimeGroup = Object.keys(unitDowntimeGroup).map( key => {
            var kode
            if(key === 'UNS'){
                kode = 'UnScheduled'
            }
            if(key === 'SCH'){
                kode = 'Scheduled'
            }
            if(key === 'ACD'){
                kode = 'Accident'
            }
            return {
                name: kode,
                persen: ((unitDowntimeGroup[key].reduce((a, b) => { return a + b.downtime_total }, 0)) / grandTotal) * 100,
                totDowntime: unitDowntimeGroup[key].reduce((a, b) => { return a + b.downtime_total }, 0),
                items: unitDowntimeGroup[key]
            }
        })

        let downtimeRatio = []
        for (const obj of unitDowntimeGroup) {
            downtimeRatio.push([obj.name, parseFloat((obj.persen).toFixed(2))])
        }

        /* GENERATE DATA TOP 10 BY DURATION */
        let downtimeType = _.groupBy(unitDowntime, 'component_group')
        downtimeType = Object.keys(downtimeType).map(key => {
            return {
                name: key,
                tot_duration: downtimeType[key].reduce((a, b) => { return a + parseFloat(b.downtime_total) }, 0),
                items: downtimeType[key]
            }
        })

        // Sorting and Limit 10
        downtimeType = downtimeType.sort((a,b) => b.tot_duration - a.tot_duration).slice(0, 10)

        const xAxisDuration = downtimeType.map(obj => obj.name)
        const seriesDuration = [
            {
                name: 'Duration By Hours', 
                color: `rgba(238, 143, 5, 0.7)`,
                data: downtimeType.map(obj => obj.tot_duration)
            }
        ]

        /* GENERATE DATA TOP 10 BY EVENT */
        let downtimeCount = _.groupBy(unitDowntime, 'component_group')
        downtimeCount = Object.keys(downtimeCount).map(key => {
            return {
                name: key,
                len_duration: downtimeCount[key].length,
                items: downtimeCount[key]
            }
        })

        const xAxisEvent = downtimeCount.map(obj => obj.name)
        const seriesEvent = [
            {
                name: 'Duration By Hours', 
                color: `rgba(238, 143, 5, 0.7)`,
                data: downtimeCount.map(obj => obj.len_duration)
            }
        ]

        return {
            success: true,
            byKPI: {
                dataTable: series,
                xAxis: data.map(obj => obj.date),
                series: [
                    {
                        name: 'MTBS', 
                        type: 'spline',
                        color: 'red',
                        data: series.map(obj => obj.actMTBS)
                    },
                    {
                        name: 'MTTR', 
                        type: 'spline',
                        color: '#ddd',
                        data: series.map(obj => obj.actMTTR)
                    },
                    {
                        name: 'Actual PA', 
                        type: req.typeChart,
                        states: {hover: {enabled: false}},
                        color: color[2] || 'red',
                        data: series.map(obj => obj.actPA)
                    },
                    {
                        name: 'Plan PA', 
                        type: req.typeChart,
                        states: {hover: {enabled: false}},
                        color: color[0] || 'red',
                        data: series.map(obj => obj.budgetPA)
                    }
                ]
            },
            byRatio: [{
                type: 'pie',
                name: 'Breakdown Ratio',
                data: downtimeRatio
            }],
            byDataRatio: unitDowntimeGroup,
            dataEvent: unitDowntime,
            byDuration: {
                xAxis: xAxisDuration,
                series: seriesDuration
            },
            byEvents: {
                xAxis: xAxisEvent,
                series: seriesEvent
            }
        }
    }

}
module.exports = new repHeavyEquipment()
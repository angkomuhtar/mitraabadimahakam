'use strict'

const moment = require("moment")
const _ = require('underscore')
const DailyFleet = use("App/Models/DailyFleet")
const DailyRitase = use("App/Models/DailyRitase")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")
const MonthlyPlan = use("App/Models/MonthlyPlan")
const DailyPlan = use("App/Models/DailyPlan")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")
const MasShift = use("App/Models/MasShift")
const MasMaterial = use("App/Models/MasMaterial")

class repPoduction {
    async MW_MONTHLY (req) {
        console.log('startMonth', req);
        let result = []
        let startMonth = req.month_begin ? moment(req.month_begin).startOf('month').format('YYYY-MM-DD') : moment().startOf('year').format('YYYY-MM-DD')
        let endMonth = req.month_end ? moment(req.month_end).endOf('month').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
        
        try {
            const data = (
                await DailyRitase.query().where( w => {
                    if(req.site_id){
                        w.where('site_id', req.site_id)
                    }
                    if(req.pit_id){
                        w.where('pit_id', req.pit_id)
                    }
                    w.where('date', '>=', startMonth)
                    w.where('date', '<=', endMonth)
                }).fetch()
            ).toJSON()
            
            let estimateAvg = (await DailyPlan.query().where( w => {
                if(req.pit_id){
                    w.where('pit_id', req.pit_id)
                }
                if(req.site_id){
                    w.where('site_id', req.site_id)
                }
                w.where('current_date', '>=', startMonth)
                w.where('current_date', '<=', endMonth)
                w.where('tipe', 'OB')
            }).fetch()).toJSON() || []
            
            estimateAvg = estimateAvg.map(el => { return {...el, ym: moment(el.current_date).format('YYYY-MM')} })
            estimateAvg = _.groupBy(estimateAvg, 'ym')
            estimateAvg = Object.keys(estimateAvg).map(key => {
                return {
                    ym: key,
                    estimate: (estimateAvg[key].reduce((a, b) => {return a + b.estimate}, 0)).toFixed(2),
                    items: estimateAvg[key]
                }
            })
            
            for (let obj of data) {
                const masMaterial = await MasMaterial.query().where('id', obj.material).last()
                const masPit = await MasPit.query().where('id', obj.pit_id).last()
                const masSite = await MasSite.query().where('id', obj.site_id).last()
                result.push({
                    ...obj,
                    nmpit: masPit.name,
                    nmsite: masSite.name,
                    vol: parseFloat(masMaterial.vol) * parseFloat(obj.tot_ritase),
                    ym: moment(obj.date).format('YYYY-MM')
                })
            }
            result = _.groupBy(result, 'ym')
            result = Object.keys(result).map(key => {
                let sum_volume = result[key].reduce((a, b) => { return a + parseInt(b.vol) }, 0)
                let avg_distance = (result[key].reduce((a, b) => { return a + parseInt(b.distance) }, 0) /  result[key].length).toFixed(2)
                let sum_rit = result[key].reduce((a, b) => { return a + parseInt(b.tot_ritase) }, 0)
                return {
                    date: key,
                    avg_distance: avg_distance,
                    sum_rit: sum_rit,
                    sum_volume: sum_volume,
                    items: result[key]
                }
            })
            result = result.map((el, i) => {
                return {
                    ...el,
                    avg_target: estimateAvg[i]?.estimate || null
                }
            })
            result = result
        } catch (error) {
            console.log('ERR CHART :::', error);
        }

        console.log('result :::', result);
        return result
    }

    async MW_WEEKLY (req) {
        let result = []
        var x = moment(req.week_begin).week()
        var y = moment(req.week_end).week()
        // console.log(x, y);

        let arrDate = []
        for (let i = x - 1; i < y; i++) {
            var str = '-W'+'0'.repeat(2 - `${i}`.length) + i
            var arrStart = moment(moment(req.week_begin).format('YYYY') + str).startOf('week').add(1, 'day')
            var arrEnd = moment(moment(req.week_end).format('YYYY') + str).endOf('week').add(1, 'day')

            var getDaysBetweenDates = function(startDate, endDate) {
                var now = startDate.clone(), dates = [];
          
                while (now.isSameOrBefore(endDate)) {
                    dates.push(now.format('YYYY-MM-DD'));
                    now.add(1, 'days');
                }
                return dates;
            };
            arrDate.push({
                date: 'week-'+i,
                site_id: req.site_id,
                pit_id: req.pit_id,
                items: getDaysBetweenDates(arrStart, arrEnd)
            })
            
        }
        for (const elm of arrDate) {
            // console.log(elm.items);
            let estimate = []
            let distance = []
            let rit = []
            let volume = []
            let items = []

            let ritase = (await DailyRitase.query().where( w => {
                if(elm.site_id){
                    w.where('site_id', elm.site_id)
                }
                if(elm.pit_id){
                    w.where('pit_id', elm.pit_id)
                }
                w.whereIn('date', elm.items)
            }).fetch()).toJSON() || []

            for (const obj of ritase) {
                const masMaterial = (await MasMaterial.query().where('id', obj.material).last()).toJSON() || []
                volume.push(parseFloat(obj.tot_ritase) * parseFloat(masMaterial.vol))
                distance.push(obj.distance)
                rit.push(obj.tot_ritase)
            }

            let plan = (await DailyPlan.query().where( w => {
                if(elm.site_id){
                    w.where('site_id', elm.site_id)
                }
                if(elm.pit_id){
                    w.where('pit_id', elm.pit_id)
                }
                w.where('tipe', 'OB')
                w.whereIn('current_date', elm.items)
            }).fetch()).toJSON()

            let tmpEstimate = plan.map(el => el.estimate).reduce((a, b) => { return a + b }, 0)
            estimate.push(tmpEstimate)
            items.push(plan)

            let avg_target = estimate.reduce((a, b) => { return a + b }, 0).toFixed(2)
            let avg_distance = (distance.reduce((a, b) => { return a + b }, 0) / distance.length).toFixed(2)
            let sum_rit = (rit.reduce((a, b) => { return a + b }, 0)).toFixed(2)
            let sum_volume = (volume.reduce((a, b) => { return a + b }, 0)).toFixed(2)
            // console.log('SUM ::', estimate);
            result.push({
                ...elm, 
                avg_target: parseFloat(avg_target),
                avg_distance: parseFloat(avg_distance),
                sum_rit: parseFloat(sum_rit),
                sum_volume: parseFloat(sum_volume),
                items: items
            })
        }

        return result
    }

    async MW_DAILY (req) {
        let result = []
        const data = (await DailyFleet.query()
        .with('ritase')
        .where( w => {
            w.where('activity_id', '11')
            if(req.pit_id){
                w.where('pit_id', req.pit_id)
            }
            if(req.shift_id){
                w.where('shift_id', req.shift_id)
            }
            if(!req.start_date || !req.end_date){
                w.where('date', '>=', moment().startOf('month').format('YYYY-MM-DD'))
                w.where('date', '<=', moment().endOf('month').format('YYYY-MM-DD'))
            }else{
                w.where('date', '>=', req.start_date)
                w.where('date', '<=', req.end_date)

            }
        }).fetch()).toJSON()
        
        
        const monthlyPlan = (
            await MonthlyPlan.query().where( w => {
                    if(req.pit_id){
                        w.where('pit_id', req.pit_id)
                    }
                    w.where('month', moment(req.start_date).startOf('month').format('YYYY-MM-DD') 
                    || moment().startOf('month').format('YYYY-MM-DD'))
                    w.where('tipe', 'OB')
                }).fetch()
            ).toJSON() || []

        let total = monthlyPlan.reduce((a, b) => { return a + b.estimate }, 0)
        let jumHari = moment(req.start_date).daysInMonth() || moment().daysInMonth()
            
        for (const obj of data) {
            let masPit = await MasPit.query().where('id', obj.pit_id).last()
            let avgDistance = (obj.ritase).reduce((a, b) => { return a + b.distance }, 0) / (obj.ritase).length || 0
            
            let totActual = []
            let totRit = []
            for (const elm of obj.ritase) {
                const masMaterial = await MasMaterial.query().where('id', elm.material).last()
                totActual.push(parseFloat(masMaterial.vol) * parseFloat(elm.tot_ritase))
                totRit.push(parseFloat(elm.tot_ritase))
            }
            result.push({
                idFleet: obj.id,
                idpit: obj.pit_id,
                nmpit: masPit.name,
                idshift: obj.shift_id,
                target: total / parseInt(jumHari),
                date: moment(obj.date).format('YYYY-MM-DD'),
                avgJarak: avgDistance,
                totRit: totRit.reduce((a, b) => { return a + b }, 0),
                avgVolume: totActual.reduce((a, b) => { return a + b }, 0)
            })
        }

        result = _.groupBy(result, 'date')
        result = Object.keys(result).map(key => {
            let avg_distance = result[key].reduce((a, b) => { return a + b.avgJarak }, 0) / result[key].length
            return {
                date: key,
                avg_distance: avg_distance.toFixed(0),
                avg_target: result[key].reduce((a, b) => { return a + b.target }, 0) / result[key].length,
                sum_rit: result[key].reduce((a, b) => { return a + b.totRit }, 0),
                sum_volume: result[key].reduce((a, b) => { return a + b.avgVolume }, 0),
                item: result[key]
            }
        })

        return result
    }

    async MW_SHIFTLY (req) {
        let result = []
        let plan = (await DailyPlan.query().where( w => {
            if(req.site_id){
                w.where('site_id', req.site_id)
            }
            if(req.pit_id){
                w.where('pit_id', req.pit_id)
            }
            w.where('current_date', '>=', req.start_date)
            w.where('current_date', '<=', req.end_date)
            w.where('tipe', 'OB')
        }).fetch()).toJSON()

        /** HITUNG TARGET SETIAP SHIFT **/
        let dataPlan = []
        const shift = (await MasShift.query().where('status', 'Y').fetch()).toJSON()
        for (const obj of plan) {
            for (const elm of shift) {
                dataPlan.push({
                    ...obj, 
                    estimate: (parseFloat(obj.estimate) / 2),
                    actual: (parseFloat(obj.actual) / 2),
                    date: moment(obj.current_date).format('YYYY-MM-DD'),
                    shift_id: elm.id, 
                    kode: elm.kode
                })
            }
        }

        /** FILTER SHIFT BY REQUEST **/
        if(req.shift_id){
            dataPlan = dataPlan.filter(el => el.shift_id === parseInt(req.shift_id))
        }

        /** GROUPING DATA BY DATE **/
        dataPlan = _.groupBy(dataPlan, 'date')
        dataPlan = Object.keys(dataPlan).map(key => {
            return {
                date: key,
                avg_target: dataPlan[key].reduce((a, b) => { return a + b.estimate}, 0),
                tot_actual: dataPlan[key].reduce((a, b) => { return a + b.actual}, 0),
                items: dataPlan[key]
            }
        })

        /** HITUNG ACTUAL TRUCK COUNT **/
        for (const obj of dataPlan) {
            const ritase = (
                await DailyRitase.query().where( w => {
                    if(req.site_id){
                        w.where('site_id', req.site_id)
                    }
                    if(req.pit_id){
                        w.where('pit_id', req.pit_id)
                    }
                    if(req.shift_id){
                        w.where('shift_id', req.shift_id)
                    }
                    w.where('date', obj.date)
                }).fetch() || []
            ).toJSON()

            let grpByShift = _.groupBy(ritase, 'shift_id')
            grpByShift = Object.keys(grpByShift).map(key => {
                return {
                    date: obj.date,
                    shift_id: key,
                    items: grpByShift[key]
                }
            })

            for (let grp of grpByShift) {
                let arrVolume = []
                const masShift = await MasShift.query().where('id', grp.shift_id).last()
                for (const vol of grp.items) {
                    const material = await MasMaterial.query().where('id', vol.material).last()
                    arrVolume.push(parseFloat(vol.tot_ritase) * parseFloat(material.vol))
                }
                grp = {
                    ...grp, 
                    nm_shift: masShift?.name || null, 
                    kd_shift: masShift?.kode || null,
                    sum_volume: arrVolume.reduce((a, b) => { return a + b }, 0)
                }
                result.push(grp)
            }
        }

        result = _.groupBy(result, 'date')
        result = Object.keys(result).map(key => {
            return {
                date: key,
                items: result[key]
            }
        })

        console.log(dataPlan);

        result = result.map((el, i) => {
            return {
                date: el.date,
                avg_target: dataPlan[i]?.avg_target || null,
                sum_volume: el.items.filter(obj => obj.kd_shift === 'DS').map(val => val.sum_volume)[0] || [0],
                sum_rit: el.items.filter(obj => obj.kd_shift === 'NS').map(val => val.sum_volume)[0] || [0],
                items: el.items
            }
        })

        return result
    }

    async MW_HOURLY (req) {
        var getHoursArray = function(start, end) {
            var arr = new Array();
            var dt = moment(start).format('YYYY-MM-DD HH:mm');
            while (dt <= end) {
                arr.push(moment(dt).format('YYYY-MM-DD HH:mm'));
                dt = moment(dt).add(1, 'hour').format('YYYY-MM-DD HH:mm')
            }
            return arr;
        }
        let startHour = moment(req.date).startOf('day').format('YYYY-MM-DD HH:mm')
        let endHour = moment(req.date).endOf('day').format('YYYY-MM-DD HH:mm')
        var arrHours = getHoursArray(startHour, endHour)

        let arrRitaseId = (await DailyRitase.query().where( w => {
            w.where('pit_id', req.pit_id)
            w.where('date', req.date)
        }).fetch()).toJSON().map(el => el.id)

        let data = []
        for (const obj of arrHours) {
            // console.log(obj.substr(11, 2));
            let x = []
            for (const val of arrRitaseId) {
                let dailyRitaseDetail = (
                    await DailyRitaseDetail.query().with('daily_ritase').where( w => {
                        w.where('dailyritase_id', val)
                        w.where('check_in', '>=', obj)
                        w.where('check_in', '<=', moment(obj).endOf('hour').format('YYYY-MM-DD HH:mm'))
                    }).fetch()).toJSON() || []

                dailyRitaseDetail = dailyRitaseDetail.map( el => {
                    return {
                        hour: moment(obj).format('HH'),
                        hauler_id: el.hauler_id,
                        site_id: el.daily_ritase.site_id,
                        pit_id: el.daily_ritase.pit_id,
                        material: el.daily_ritase.material
                    }
                })
                if (dailyRitaseDetail.length > 0) {
                    data.push(dailyRitaseDetail)
                }
            }
        }

        let joinData = _.flatten(data)
        
        
        let grouping = []
        for (const obj of joinData) {
            const material = await MasMaterial.query().where('id', obj.material).last()
            grouping.push({
                ...obj,
                vol: parseFloat(material.vol)
            })
        }

        grouping = _.groupBy(grouping, 'hour')
        grouping = Object.keys(grouping).map(key => {
            return {
                date: 'Hour-' + key,
                sum_volume: parseFloat(grouping[key][0].vol) * parseFloat(grouping[key].length),
                items: grouping[key]
            }
        })

        grouping = _.sortBy(grouping, function(num){ return num.date })

        return grouping
    }

    async PW_MONTHLY (req) {
        let result = []
        let data = (
            await MonthlyPlan.query()
            .with('pit', w => w.with('site'))
            .where( w => {
                w.where('tipe', req.production_type)
                w.where('month', '>=', moment(req.month_begin).startOf('month').format('YYYY-MM-DD'))
                w.where('month', '<=', moment(req.month_end).endOf('month').format('YYYY-MM-DD'))
            }).fetch()
        ).toJSON()

        data = data.map( el => {
            return {
                    xAxis: moment(el.month).format('MMM YYYY'),
                    estimate: el.estimate,
                    actual: el.actual,
                    nm_pit: el.pit.name,
                    nm_site: el.pit.site.name,
            }
        })

        result = _.groupBy(data, 'nm_pit')
        result = Object.keys(result).map(key => {
            return {
                    nm_pit: key,
                    items: result[key]
            }
        })

        let xAxis = _.groupBy(data, 'xAxis')
        xAxis = Object.keys(xAxis).map(key => {
            return {
                x_axis: key
            }
        })
        // console.log(JSON.stringify(data, null, 2));
        return {
            xAxis: xAxis.map( el => el.x_axis),
            data: result
        }
    }

    async PW_WEEKLY (req) {

    }

    async PW_DAILY (req) {

    }

    async PW_SHIFTLY (req) {

    }

    async PW_HOURLY (req) {

    }
}
module.exports = new repPoduction()
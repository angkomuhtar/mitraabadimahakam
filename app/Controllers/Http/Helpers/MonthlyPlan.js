'use strict'

const DailyRitaseCoalDetail = use("App/Models/DailyRitaseCoalDetail")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")
const DailyRitaseCoal = use("App/Models/DailyRitaseCoal")
const DailyRitase = use("App/Models/DailyRitase")
const MonthlyPlans = use("App/Models/MonthlyPlan")
const DailyFleet = use("App/Models/DailyFleet")
const DailyPlans = use("App/Models/DailyPlan")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")
const { add, includes } = require('lodash')
const moment = require('moment')
const _ = require('underscore')
const db = use('Database')

class MonthlyPlan {
    async ALL_MONTHLY (req) {
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)

        const data = (
            await MonthlyPlans
            .query()
            .with('pit')
            .orderBy('created_at', 'desc')
            .paginate(halaman, limit)
        ).toJSON()

        let result = []

        for (const item of data.data) {
            result.push({
                ...item,
                actual: item.tipe === 'BB' ? 
                (
                    item.actual != 0 ? parseFloat(item.actual) / 1000 : 0
                ) 
                : 
                item.actual
            })
        }

        return {...data, data: result}
    }

    async CHARTIST_MONTHLY_OB (req) {

        const bulan = new Date(req.periode)

        let currentMonthDates = Array.from({length: moment(bulan).daysInMonth()}, 
        (x, i) => moment(bulan).startOf('month').add(i, 'days').format('YYYY-MM-DD'))


        
        let label = []
        for (const obj of currentMonthDates) {
            const day = obj.substr(8, 2)
            label.push(day);
        }
        

        try {
            let dailyPlans = []
            for (const tgl of currentMonthDates) {
                let arrDailyPlans = (
                    await DailyPlans
                        .query()
                        .where( w => {
                            w.where('current_date', tgl)
                            w.where('tipe', 'OB')
                        })
                        .fetch()
                ).toJSON()

                dailyPlans.push({
                    data: arrDailyPlans,
                    date: tgl
                })
            }

            let data = []

            for (const obj of dailyPlans) {
                for (const val of obj.data) {
                    data.push({
                        meta: val.monthlyplans_id,
                        value: val.actual,
                        tgl: moment(val.current_date).format('YYYY-MM-DD')
                    })
                }
            }
        
            let grpByPIT = _.groupBy(data, 'meta')
            grpByPIT = Object.keys(grpByPIT).map(key => {
                return {
                    mp_id: key,
                    item: grpByPIT[key]
                }
            })

            let mapPIT = []
            for (const elm of grpByPIT) {
                let tmp = []
                for (const val of elm.item) {
                    tmp.push(val);
                }
                mapPIT.push(tmp)
            }

            let sumData = []
            for (const elm of dailyPlans) {
                for (const val of elm.data) {
                    sumData.push(val)
                }
                
            }
            let sumActual = sumData.reduce((a, b) => { return a + b.actual }, 0)
            let sumEstimate = sumData.reduce((a, b) => { return a + b.estimate }, 0)

            /* GET PIT NAME */

            let dataSeries = []
            for (const item of mapPIT) {
                let tmp = []
                for (const elm of item) {
                    const monthlyPlan = (await MonthlyPlans.query().with('pit').where('id', elm.meta).last()).toJSON()
                    tmp.push({...elm, meta: monthlyPlan.pit.name})
                }
                dataSeries.push(tmp)
            }

            /*-GET PIT NAME-*/

            return {
                sum_estimasi: sumEstimate,
                sum_actual: sumActual,
                labels: label,
                series: dataSeries
            }
        } catch (error) {
            console.log(error);
            return {
                monthly_plan: {
                    month: moment().format('MMMM YYYY'),
                    satuan: 'BCM',
                    estimate: 0,
                    actual: 0
                },
                labels: currentMonthDates,
                actual: []
            }
        }
    }

    async CHARTIST_MONTHLY_COAL (req) {

        const bulan = new Date(req.periode)

        
        let currentMonthDates = Array.from({length: moment(bulan).daysInMonth()}, 
        (x, i) => moment(bulan).startOf('month').add(i, 'days').format('YYYY-MM-DD'))
        
        const dailyFleet = (
            await DailyFleet
            .query()
            .with('pit')
            .where( w => {
                w.where('activity_id', 8)
                w.where('date', '>=', moment(bulan).startOf('month').format('YYYY-MM-DD'))
                w.where('date', '<=', moment(bulan).endOf('month').format('YYYY-MM-DD'))
            }).fetch()
        ).toJSON()

        let arrDailyFleet = _.groupBy(
            dailyFleet.map(elm => { 
                return {
                    id: elm.id, 
                    pit: elm.pit.name
                }
            }), num => { 
                return num.pit
            })

        arrDailyFleet = Object.keys(arrDailyFleet).map(key => { 
            return {
                pit_name: key,
                dailyfleet_id: arrDailyFleet[key].map(elm => { 
                    return {
                        id:  elm.id
                    }
                })
            }
        })
        
        const res_GET_COAL_BY_ID_DAILY_FLEET = await GET_COAL_BY_ID_DAILY_FLEET (arrDailyFleet)

        let tmp = []

        for (const item of res_GET_COAL_BY_ID_DAILY_FLEET) {
            let arr = []
            for (const val of item.data) {
                arr.push({meta: item.meta, date: val.tgl, value: (val.value).toFixed(2)})
            }
            tmp.push(arr)
        }

        let y = []
        for (const item of tmp) {
            let x = []
            for (const val of currentMonthDates) {
                let arr = item.map(x => x.date)

                if(!arr.includes(val)){
                    x.push({meta: item[0].meta, date: val, value: 0});
                }
            }
            y.push(x)
        }
        let result = []
        
        for (const [i, elm] of tmp.entries()) {
            result.push([...tmp[i], ...y[i]])
        }

        result = result.map(val => {
            return _.sortBy(val, 'date');
        })

        const monthlyAvg = (
            await MonthlyPlans.query().where( w => {
                w.where('tipe', 'BB')
                w.where('month', 'like', `${moment(bulan).format('YYYY-MM')}%`)
            })
            .fetch()
        ).toJSON()

        const estimasi = monthlyAvg.reduce((a, b) => {return a + b.estimate}, 0)
        const aktual = monthlyAvg.reduce((a, b) => {return a + b.actual}, 0) / 1000
        const persen = (aktual / estimasi) * 100
        const data = {
            monthly_plan: {
                month: moment(bulan).format('MMMM YYYY'),
                satuan: 'MT',
                estimate: estimasi,
                actual: (aktual).toFixed(2),
                persen: (persen).toFixed(2)
            },
            labels: currentMonthDates.map(list => list.substr(8, 2)),
            actual: result
        }

        return data
    }

    async CHART_MOTHLY_COAL (req) {
        const bulan = new Date(req.periode)
        const currentMonthDates = Array.from({length: moment(bulan).daysInMonth()}, 
        (x, i) => moment(bulan).startOf('month').add(i, 'days').format('YYYY-MM-DD'))

        let sumData = []
        
        for (const tgl of currentMonthDates) {
            const tgl_awal = tgl + ' 07:00:59'
            const tgl_akhir = moment(tgl_awal).add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
            
            try {
                let arrData = []
                
                const dailyData = (
                    await DailyRitaseCoalDetail
                    .query()
                    .with('seam', a => a.with('pit'))
                    .with('transporter')
                    .with('ritase_coal')
                    .where(
                        w => {
                            w.where('checkout_jt', '>=', tgl_awal)
                            w.where('checkout_jt', '<=', tgl_akhir)
                        }
                    ).fetch()
                ).toJSON()

               
                if(dailyData.length > 0){
                    for (const val of dailyData) {
                        arrData.push({...val, tgl: tgl})
                    }
                }

                for (const elm of arrData) {
                    sumData.push({
                        pit_name: elm.seam.pit.name,
                        tgl: tgl,
                        w_gross: elm.w_gross,
                        w_tare: elm.w_tare,
                        w_netto: elm.w_netto
                    })
                }

            } catch (error) {
                console.log(error);
            }
        }


        sumData = _.groupBy(sumData, 'pit_name')

        sumData = Object.keys(sumData).map(elm => {

            let data = _.groupBy(sumData[elm], 'tgl')

            console.log(data);

            let grpByDate = Object.keys(data).map(val => {
                return {
                    tgl: val,
                    w_netto: data[val].reduce((a, b) => { return a + b.w_netto }, 0)
                }
            })

            return {
                pit: elm,
                data: grpByDate
            }
        })

        let result = []
        let totalActual = []

        for (const elm of  _.sortBy(sumData, 'pit')) {
            var x = elm.data.map(val => val.tgl)
            for (const tgl of currentMonthDates) {
                if(!x.includes(tgl)){
                    elm.data.push({tgl: tgl, w_netto: 0})
                }
            }
            let tmp = []
            for (const res of _.sortBy(elm.data, 'tgl')) {
                tmp.push({
                    meta: elm.pit,
                    date: res.tgl,
                    value: res.w_netto
                })
                totalActual.push(res.w_netto)
            }
            result.push(tmp)
        }


        const monthlyAvg = (
            await MonthlyPlans.query().where( w => {
                w.where('tipe', 'BB')
                w.where('month', 'like', `${moment(bulan).format('YYYY-MM')}%`)
            })
            .fetch()
        ).toJSON()

        // let xxx = result.reduce((a, b) => {return a + b.})

        console.log(totalActual.reduce((a, b) => {return a + b}, 0));

        const estimasi = monthlyAvg.reduce((a, b) => {return a + b.estimate}, 0)
        const aktual = totalActual.reduce((a, b) => {return a + b}, 0) / 1000
        const persen = (aktual / estimasi) * 100
        const dataRes = {
            monthly_plan: {
                month: moment(bulan).format('MMMM YYYY'),
                satuan: 'MT',
                estimate: estimasi,
                actual: (aktual),
                persen: (persen).toFixed(2)
            },
            labels: currentMonthDates.map(list => list.substr(8, 2)),
            actual: result
        }

        return dataRes
    }

    async CHARTIST_RITASE_OB_EQUIPMENT(req) {
        const date = req.periode ? moment(req.periode).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
        try {
            const data = (await DailyRitase
                .query()
                .with('unit')
                .with('daily_fleet', a => a.with('fleet'))
                .with('ritase_details')
                .where('date', 'like', `${date}`)
                .fetch()).toJSON()
            // console.log('DATA>>>> ', data);
            return data.map(item => {
                return {
                    fleet: item.daily_fleet.fleet.kode,
                    name: item.daily_fleet.fleet.name,
                    exca: item.unit ? item.unit.kode : 'UNSET',
                    tot_ritase: item.tot_ritase
                }
            })
        } catch (error) {
            return {
                fleet: ['F01', 'F02', 'F03', 'F04', 'F05'],
                tot_ritase: [0,0,0,0]
            }
        }
    }

    async ALL_DAILY (req) {
        const limit = 31
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        // const data = await DailyPlans.query().with('monthly_plan').where('monthlyplans_id', req.monthlyplans_id).paginate(halaman, limit)
        let data = (await DailyPlans.query().with('monthly_plan').where('monthlyplans_id', req.monthlyplans_id).paginate(halaman, limit)).toJSON()
        let result = []
        for (const item of data.data) {
            result.push({
                ...item,
                actual: item.actual != 0 ? parseFloat(item.actual) / 1000 : 0
            })
        }
        return {...data, data: result}
    }

    async GET_ID (params) {
        const data = await MonthlyPlans.find(params.id)
        return data
    }

    async POST (req) { 
        const { pit_id, tipe, month, estimate, actual } = req
        const satuan = req.tipe === 'OB' ? 'BCM':'MT'
        try {
            const monthlyPlans = new MonthlyPlans()
            monthlyPlans.fill({pit_id, tipe, month, estimate, actual, satuan})
            await monthlyPlans.save()
            const data = await MonthlyPlans.query().with('daily_plan').last()
            return data
        } catch (error) {
            console.log(error);
        }
    }

    async UPDATE (params, req) {
        let monthlyPlans = await MonthlyPlans.find(params.id)
        try {
            await monthlyPlans.delete()
            monthlyPlans = new MonthlyPlans()
            monthlyPlans.fill(req)
            await monthlyPlans.save()
            return monthlyPlans
        } catch (error) {
            throw new Error('Failed...')
        }
    }
}

module.exports = new MonthlyPlan()


async function GET_COAL_BY_ID_DAILY_FLEET (data) {
    let result = []
    let obj = []

    
    for (const fleet of data) {
        let elm1 = []

        for (const item of fleet.dailyfleet_id) {
            const coal_rit = (
                await DailyRitaseCoal
                .query()
                .where('dailyfleet_id', item.id)
                .fetch()
            ).toJSON()

            if(coal_rit.length > 0){
                let elm2 = []
                for (const val of coal_rit) {
                    const sum_total = await DailyRitaseCoalDetail.query().where('ritasecoal_id', val.id).getSum('w_netto')
                    elm1.push({
                        id: val.id, 
                        shift_id: val.shift_id,
                        date: moment(val.date).format('YYYY-MM-DD'),
                        coal_rit: val.coal_rit,
                        total_kg: sum_total ? (sum_total / 1000).toFixed(2) : 0
                    })
                }
                if(elm2.length > 0){
                    elm1.push(elm2)
                }
            }
        }
        obj.push({...fleet, data: elm1})
    }

    // console.log('DATA ::', JSON.stringify(obj, null, 2));

    for (const val of _.sortBy(obj, 'pit_name')) {
        let tmp = []
        delete val['dailyfleet_id']
        let grpTanggal = _.groupBy(val.data, num => { return num.date })
        grpTanggal = Object.keys(grpTanggal).map(key => {
            return {
                tgl: key,
                data: grpTanggal[key]
            }
        })
        for (const obj of grpTanggal) {
            tmp.push({
                pit: val.pit_name,
                tgl: obj.tgl,
                value: obj.data.reduce((x, y) => {return x + parseFloat(y.total_kg)}, 0)
            })
        }
        result.push({meta: val.pit_name, data: tmp})
    }


    
    return result
}
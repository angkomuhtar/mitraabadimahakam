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
const MasEquipment = use("App/Models/MasEquipment")
const VRitaseObPerjam = use("App/Models/VRitaseObPerjam")
const VRitaseCoalPerjam = use("App/Models/VRitaseCoalPerjam")

class repPoduction {
    async MW_MONTHLY (req) {
        // console.log('startMonth', req);
        let result = []
        let data
        try {
            data = (
                await MonthlyPlan.query()
                .with('pit', w => w.with('site'))
                .where( w => {
                    if(req.production_type){
                        w.where('tipe', req.production_type)
                    }
                    if(req.pit_id){
                        w.where('pit_id', req.pit_id)
                    }
                    w.where('site_id', req.site_id)
                    w.where('tipe', req.production_type)
                    w.where('month', '>=', moment(req.month_begin).startOf('month').format('YYYY-MM-DD'))
                    w.where('month', '<=', moment(req.month_end).endOf('month').format('YYYY-MM-DD'))
                }).orderBy('month').fetch()
            ).toJSON()

            let xAxis = data.map(el => moment(el.month).format('MMM YY'))

            let estimate  = data.map( el => {
                return {
                        volume: el.estimate,
                        nm_pit: el.pit.name,
                        nm_site: el.pit.site.name,
                }
            })

            let color = req.colorGraph
            estimate = _.groupBy(estimate, 'nm_pit')
            estimate = Object.keys(estimate).map(key => {
                return {
                    nm_pit: `Target (${key})`,
                    type: 'column',
                    color: color[0],
                    items: estimate[key]
                }
            })

            let actual  = data.map( el => {
                return {
                        volume: el.actual,
                        nm_pit: el.pit.name,
                        nm_site: el.pit.site.name,
                }
            })

            actual = _.groupBy(actual, 'nm_pit')
            actual = Object.keys(actual).map(key => {
                return {
                    nm_pit: `Actual (${key})`,
                    type: req.typeChart,
                    color: color[1],
                    items: actual[key]
                }
            })

            let trand  = data.map( el => {
                return {
                        volume: el.actual,
                        nm_pit: el.pit.name,
                        nm_site: el.pit.site.name,
                }
            })

            trand = _.groupBy(trand, 'nm_pit')
            trand = Object.keys(trand).map(key => {
                return {
                    nm_pit: `Trands`,
                    type: 'spline',
                    color: color[2],
                    items: trand[key]
                }
            })

            return {
                xAxis: xAxis,
                data: [...estimate, ...actual, ...trand]
            }
        } catch (error) {
            console.log('ERR CHART :::', error);
        }

        console.log('result :::', result);
        return result
    }

    async MW_WEEKLY (req) {
        // console.log('HELPERS :::', req);
        let color = req.colorGraph
        let result = []
        var x = moment(req.week_begin).week()
        var y = moment(req.week_end).week()
        

        let arrDate = []
        for (let i = x - 1; i < y; i++) {
            var str = '-W'+'0'.repeat(2 - `${i}`.length) + i
            var arrStart = moment(moment(req.week_begin).format('YYYY') + str).startOf('week').add(1, 'day')
            var arrEnd = moment(moment(req.week_end).format('YYYY') + str).endOf('week').add(1, 'day')

            const pit = (await MasPit.query().with('site').where('id', req.pit_id).last()).toJSON()

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
                kd_pit: pit.kode,
                nm_pit: pit.name,
                items: getDaysBetweenDates(arrStart, arrEnd)
            })
        }

        let xAxis = _.rest(arrDate.map(el => el.date))
        

        let tmpActual = []
        let tmpTarget = []
        let tmpTrands = []

        req.production_type = req.production_type != 'OB' ? 'COAL' : 'OB'
        
        for (const obj of _.rest(arrDate)) {

            let planActual = await DailyPlan.query().where( w => {
                if(req.production_type){
                    w.where('tipe', req.production_type)
                }
                w.where('site_id', req.site_id)
                w.where('current_date', '>=', _.first(obj.items))
                w.where('current_date', '<=', _.last(obj.items))
            }).select('actual').getSum('actual') || 0

            let planTarget = await DailyPlan.query().where( w => {
                if(req.production_type){
                    w.where('tipe', req.production_type)
                }
                w.where('current_date', '>=', _.first(obj.items))
                w.where('current_date', '<=', _.last(obj.items))
            }).select('estimate').getSum('estimate') || 0

            

            tmpTarget.push({
                nm_pit: `Target ${obj.nm_pit}`,
                volume: planTarget
            })
            tmpActual.push({
                nm_pit: `Actual ${obj.nm_pit}`,
                volume: planActual
            })
            tmpTrands.push({
                nm_pit: `Trands`,
                volume: planActual
            })
        }

        tmpTarget = _.groupBy(tmpTarget, 'nm_pit')
        tmpTarget = Object.keys(tmpTarget).map(key => {
            return {
                nm_pit: key,
                color: color[3],
                type: req.typeChart,
                items: tmpTarget[key]
            }
        })
        tmpActual = _.groupBy(tmpActual, 'nm_pit')
        tmpActual = Object.keys(tmpActual).map(key => {
            return {
                nm_pit: key,
                color: color[4],
                type: req.typeChart,
                items: tmpActual[key]
            }
        })
        tmpTrands = _.groupBy(tmpTrands, 'nm_pit')
        tmpTrands = Object.keys(tmpTrands).map(key => {
            return {
                nm_pit: key,
                color: color[5],
                type: 'spline',
                items: tmpTrands[key]
            }
        })

        return {
            xAxis: xAxis,
            data: [...tmpTarget, ...tmpActual, ...tmpTrands]
        }
    }

    async MW_DAILY (req) {
        let result = []
        let color = req.colorGraph
        req.production_type = req.production_type != 'OB' ? 'COAL' : 'OB'

        let planDaily 
        try {
            planDaily = (await DailyPlan.query().where( w => {
                if(req.production_type){
                    w.where('tipe', req.production_type)
                }
                w.where('site_id', req.site_id)
                w.where('pit_id', req.pit_id)
                w.where('current_date', '>=', req.start_date)
                w.where('current_date', '<=', req.end_date)
            }).fetch()).toJSON()
        } catch (error) {
            console.log(error);
        }


        let xAxis = planDaily.map(el => moment(el.current_date).format('DD/MM/YY'))
        let short_xAxist = planDaily.map(el => moment(el.current_date).format('DD/MM'))

        let arrTarget = []
        let arrActual = []
        let arrTrands = []
        let arrDiff = []
        for (const el of planDaily) {
            const pit = await MasPit.query().where('id', el.pit_id).last()
            arrTarget.push({
                site_id: el.site_id,
                pit_id: el.pit_id,
                kd_pit: pit.kode,
                nm_pit: `Target ${pit.name}`,
                current_date: moment(el.current_date).format('DD/MM/YY'),
                volume: el.estimate
            })
            arrActual.push({
                site_id: el.site_id,
                pit_id: el.pit_id,
                kd_pit: pit.kode,
                nm_pit: `Actual ${pit.name}`,
                current_date: moment(el.current_date).format('DD/MM/YY'),
                volume: el.actual
            })
            arrTrands.push({
                site_id: el.site_id,
                pit_id: el.pit_id,
                kd_pit: pit.kode,
                nm_pit: `Trands ${pit.name}`,
                current_date: moment(el.current_date).format('DD/MM/YY'),
                volume: el.actual
            })
            arrDiff.push({
                site_id: el.site_id,
                pit_id: el.pit_id,
                kd_pit: pit.kode,
                nm_pit: `Diff ${pit.name}`,
                current_date: moment(el.current_date).format('DD/MM/YY'),
                volume: parseFloat(el.actual) - parseFloat(el.estimate)
            })
        }

        arrTarget = _.groupBy(arrTarget, 'nm_pit')
        arrTarget = Object.keys(arrTarget).map(key => {
            return {
                nm_pit: key,
                color: color[0],
                type: req.typeChart,
                items: arrTarget[key]
            }
        })
        arrActual = _.groupBy(arrActual, 'nm_pit')
        arrActual = Object.keys(arrActual).map(key => {
            return {
                nm_pit: key,
                color: color[1],
                type: req.typeChart,
                items: arrActual[key]
            }
        })
        arrDiff = _.groupBy(arrDiff, 'nm_pit')
        arrDiff = Object.keys(arrDiff).map(key => {
            return {
                nm_pit: key,
                color: color[2],
                type: req.typeChart,
                items: arrDiff[key]
            }
        })
        arrTrands = _.groupBy(arrTrands, 'nm_pit')
        arrTrands = Object.keys(arrTrands).map(key => {
            return {
                nm_pit: key,
                color: color[3],
                type: 'spline',
                items: arrTrands[key]
            }
        })

        console.log(arrActual);

        return {
            xAxis: xAxis,
            short_xAxist: short_xAxist,
            data: [...arrTarget, ...arrActual, ...arrDiff, ...arrTrands]
        }
    }

    async MW_SHIFTLY (req) {
        let color = req.colorGraph
        req.production_type = req.production_type != 'OB' ? 'COAL' : 'OB'
        let result = []
        let planDaily = (await DailyPlan.query().where( w => {
            if(req.production_type){
                w.where('tipe', req.production_type)
            }
            if(req.site_id){
                w.where('site_id', req.site_id)
            }
            if(req.pit_id){
                w.where('pit_id', req.pit_id)
            }
            w.where('current_date', '>=', req.start_date)
            w.where('current_date', '<=', req.end_date)
        }).fetch()).toJSON()

        let xAxis = planDaily.map(el => moment(el.current_date).format('DD-MM-YYYY'))
        
        let arrTarget = []
        let arrActual = []
        let arrTrands = []
        for (const el of planDaily) {
            const pit = await MasPit.query().where('id', el.pit_id).last()
            arrTrands.push({
                site_id: el.site_id,
                pit_id: el.pit_id,
                kd_pit: pit.kode,
                nm_pit: `Trends`,
                stack: 'Trends',
                current_date: moment(el.current_date).format('DD-MM-YYYY'),
                volume: el.actual
            })
            let shift = ['DS', 'NS']
            for (const [i, val] of shift.entries()) {
                arrTarget.push({
                    site_id: el.site_id,
                    pit_id: el.pit_id,
                    kd_pit: pit.kode,
                    nm_pit: `Target ${val}`,
                    stack: val,
                    current_date: moment(el.current_date).format('DD-MM-YYYY'),
                    volume: el.estimate /2
                })
                arrActual.push({
                    site_id: el.site_id,
                    pit_id: el.pit_id,
                    kd_pit: pit.kode,
                    nm_pit: `Actual ${val}`,
                    stack: val,
                    current_date: moment(el.current_date).format('DD-MM-YYYY'),
                    volume: el.actual /2
                })
            }
        }

        arrTarget = _.groupBy(arrTarget, 'nm_pit')
        arrTarget = Object.keys(arrTarget).map(key => {
            return {
                nm_pit: key,
                stack: 'target',
                color: color[3],
                type: req.typeChart,
                items: arrTarget[key]
            }
        })
        arrActual = _.groupBy(arrActual, 'nm_pit')
        arrActual = Object.keys(arrActual).map(key => {
            return {
                nm_pit: key,
                stack: 'actual',
                color: color[4],
                type: req.typeChart,
                items: arrActual[key]
            }
        })
        arrTrands = _.groupBy(arrTrands, 'nm_pit')
        arrTrands = Object.keys(arrTrands).map(key => {
            return {
                nm_pit: key,
                stack: 'trands',
                color: color[5],
                type: 'spline',
                items: arrTrands[key]
            }
        })

        result = [...arrTarget, ...arrActual, ...arrTrands]

        result = _.sortBy(result, 'stack')
        // console.log(result);
        return {
            xAxis: xAxis,
            data: result
        }
    }

    async MW_HOURLY (req) {
        let result = []
        let color = req.colorGraph
        req.production_type = req.production_type != 'OB' ? 'COAL' : 'OB'

        var getHoursArray = function(start, end) {
            var arr = new Array();
            var dt = moment(start).format('YYYY-MM-DD HH:mm');
            while (dt <= end) {
                arr.push(moment(dt).format('YYYY-MM-DD HH:mm'));
                dt = moment(dt).add(1, 'hour').format('YYYY-MM-DD HH:mm')
            }
            return arr;
        }

        let startHour = moment(req.start_date).format('YYYY-MM-DD HH:mm')
        let endHour = moment(req.end_date).format('YYYY-MM-DD HH:mm')
        var arrHours = getHoursArray(startHour, endHour)

        
        let arrRitaseId = (await DailyRitase.query().where( w => {
            w.where('pit_id', req.pit_id)
            w.where('date', moment(req.start_date).format('YYYY-MM-DD'))
        }).fetch()).toJSON().map(el => el.id)
        
        

        let data = []
        for (const obj of arrHours) {
            for (const val of arrRitaseId) {
                let dailyRitaseDetail = (
                    await DailyRitaseDetail.query().with('daily_ritase').where( w => {
                        w.where('dailyritase_id', val)
                        w.where('check_in', '>=', moment(obj).startOf('hour').format('YYYY-MM-DD HH:mm'))
                        w.where('check_in', '<=', moment(obj).endOf('hour').format('YYYY-MM-DD HH:mm'))
                    }).fetch()).toJSON() || []
                        
                    for (const el of dailyRitaseDetail) {
                        const equipment = await MasEquipment.query().where('id', el.hauler_id).last()
                        const material = await MasMaterial.query().where('id', el.daily_ritase.material).last()
                        var volume = equipment.tipe === 'hauler truck' ? material.vol : equipment.qty_capacity
                        data.push({
                            hour: moment(obj).format('HH'),
                            hauler_id: el.hauler_id,
                            site_id: el.daily_ritase.site_id,
                            pit_id: el.daily_ritase.pit_id,
                            material: el.daily_ritase.material,
                            volume: volume || 0
                        })
                }
            }
        }
        
        let joinData = _.flatten(data)
        joinData = _.groupBy(joinData, 'hour')
        joinData = Object.keys(joinData).map(key => {
            return {
                jamx: 'Pukul ' + key,
                // sum_volume: parseFloat(joinData[key][0].vol) * parseFloat(joinData[key].length),
                sum_volume: joinData[key].reduce((a, b) => { return a + b.volume }, 0),
                items: joinData[key]
            }
        })
        joinData = _.sortBy(joinData, 'jamx')
                
        let xAxis = joinData.map(el => el.jamx)
        
        

        /** GET TARGET PERJAM **/
        const dailyPlan = await DailyPlan.query().where( w => {
            w.where('tipe', req.production_type)
            w.where('current_date', moment(req.start_date).format('YYYY-MM-DD'))
            w.where('pit_id', req.pit_id)
        }).last()
        
        let target = parseFloat((dailyPlan.toJSON().estimate / 22)?.toFixed(2))

        result = joinData.map(el => {
            return {
                ...el,
                name: el.jamx,
                target: target
            }
        })

        
        // console.log('zzzz', result.data);
        let resultx = [
            {
                name: 'Target', 
                type: req.typeChart, 
                stack: 'tgt', 
                color: color[0], 
                items: xAxis.map(el => target)
            },
            {
                name: 'Actual', 
                type: req.typeChart, 
                stack: 'act', 
                color: color[1], 
                items: result.map(el => {
                    return {
                        volume: el.sum_volume
                    }
                })
            },
            {
                name: 'Trands', 
                type: 'spline', 
                stack: 'act', 
                color: color[2], 
                items: result.map(el => {
                    return {
                        volume: el.sum_volume
                    }
                })
            }
        ]
        // console.log('xxx', resultx);
        return {
            xAxis: xAxis,
            data: resultx
        }
    }

    async PW_MONTHLY (req) {
        let result = []
        let data = (await MonthlyPlan.query()
            .with('pit', w => w.with('site'))
            .where( w => {
                w.where('tipe', req.production_type)
                w.where('site_id', req.site_id)
                w.where('month', '>=', moment(req.month_begin).startOf('month').format('YYYY-MM-DD'))
                w.where('month', '<=', moment(req.month_end).endOf('month').format('YYYY-MM-DD'))
            }).orderBy('month').fetch()).toJSON()

        data = data.map( el => {
            return {
                    xAxis: moment(el.month).format('MMM YYYY'),
                    date: moment(el.month).startOf('month').format('YYYY-MM-DD'),
                    pit_id: el.pit_id,
                    estimate: el.estimate,
                    actual: el.actual,
                    nm_pit: el.pit.name,
                    nm_site: el.pit.site.name,
            }
        })

        

        let color = req.colorGraph
        result = _.groupBy(data, 'nm_pit')
        result = Object.keys(result).map((key, i) => {
            return {
                    nm_pit: key,
                    type: req.typeChart,
                    color: color[i],
                    items: result[key]
            }
        })

        console.log(result);
       
        let arrTrands = []
        for (const [i, obj] of result.entries()) {
            arrTrands.push({
                nm_pit: 'Trands '+obj.nm_pit,
                type: 'spline',
                color: color[i],
                items: obj.items
            })
        }
        let joinTrends = [...result, ...arrTrands]

        let xAxis = _.groupBy(data, 'xAxis')
        xAxis = Object.keys(xAxis).map(key => {
            return {
                x_axis: key
            }
        })

        const site = await MasSite.query().where('id', req.site_id).last()

        return {
            site_nm: site.name,
            xAxis: xAxis.map( el => el.x_axis),
            data: req.typeChart === 'column' ? joinTrends : result
        }
    }

    async PW_WEEKLY (req) {
        let result = []
        let arrDate = []
        req.production_type = req.production_type != 'OB' ? 'COAL' : 'OB'
        var x = moment(req.week_begin).week()
        var y = moment(req.week_end).week()
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

            var arrTgl = getDaysBetweenDates(arrStart, arrEnd)
            arrDate.push({
                date: 'week-'+i,
                site_id: req.site_id,
                items: arrTgl
            })
        }
        
        const arrPIT = (await MasPit.query().where( w => {
            w.where('site_id', req.site_id)
            w.where('sts', 'Y')
        }).fetch()).toJSON()

        for (const obj of arrDate) {
            for (const val of arrPIT) {
                const sumACT = await DailyPlan.query().where( w => {
                    w.where('tipe', req.production_type)
                    w.where('site_id', req.site_id)
                    w.where('pit_id', val.id)
                    w.whereIn('current_date', obj.items)
                }).getSum('actual')
                result.push({
                    date: obj.date,
                    site_id: obj.site_id,
                    pit_id: val.id,
                    nm_pit: val.name,
                    actual: sumACT
                })
            }
        }

        let color = req.colorGraph
        result = _.groupBy(result, 'nm_pit')
        result = Object.keys(result).map((key, i) => {
            // console.log(i);
            return {
                nm_pit: key,
                type: req.typeChart,
                color: color[i],
                items: result[key]
            }
        })

        let arrTrands = []
        for (const [i, obj] of result.entries()) {
            arrTrands.push({
                nm_pit: 'Trands '+obj.nm_pit,
                type: 'spline',
                color: color[i],
                items: obj.items
            })
        }
        let joinTrends = [...result, ...arrTrands]

        const site = await MasSite.query().where('id', req.site_id).last()

        return {
            site_nm: site.name,
            xAxis: arrDate.map( el => el.date),
            data: req.typeChart === 'column' ? joinTrends : result
        }
    }

    async PW_DAILY (req) {
        console.log('req');
        req.production_type = req.production_type != 'OB' ? 'COAL' : 'OB'
        let result = []
        let arrData = (await DailyPlan.query().where( w => {
            w.where('tipe', req.production_type)
            w.where('site_id', req.site_id)
            w.where('current_date', '>=', req.start_date)
            w.where('current_date', '<=', req.end_date)
        }).fetch()).toJSON()

        // console.log(req.start_date);
        // console.log(req.end_date);
        // console.log(req.production_type);

        let arrDate = _.uniq(arrData.map( el => moment(el.current_date).format('DD MMM YYYY')))

        for (const obj of arrData) {
            const pit = await MasPit.query().with('site').where('id', obj.pit_id).last()
            result.push({
                site_id: obj.site_id,
                nm_site: pit.site.name,
                pit_id: obj.pit_id,
                nm_pit: pit.name,
                actual: obj.actual,
                estimate: obj.estimate,
                tipe: obj.tipe,
                current_date: moment(obj.current_date).format('YYYY-MM-DD')
            })
        }

        let color = req.colorGraph
        result = _.groupBy(result, 'nm_pit')
        result = Object.keys(result).map((key, i) => {
            return {
                nm_pit: key,
                type: req.typeChart,
                color: color[i],
                items: result[key]
            }
        })

        let arrTrands = []
        for (const [i, obj] of result.entries()) {
            arrTrands.push({
                nm_pit: 'Trands '+obj.nm_pit,
                type: 'spline',
                color: color[i],
                items: obj.items
            })
        }
        let joinTrends = [...result, ...arrTrands]

        return {
            xAxis: arrDate,
            data: req.typeChart === 'column' ? joinTrends : result
        }
    }

    async PW_SHIFTLY (req) {
        console.log(req);
        let xresult = []
        
        let arrData = (
            await DailyRitase.query()
            .with('shift')
            .with('pit', w => w.with('site'))
            .where( w => {
                if(req.shift_id){
                    w.where('shift_id', req.shift_id)
                }
                w.where('site_id', req.site_id)
                w.where('date', '>=', moment(req.start_date).format('YYYY-MM-DD'))
                w.where('date', '<=', moment(req.end_date).format('YYYY-MM-DD'))
            }).fetch()
        ).toJSON()
        
        // console.log(arrData);

        let arrDate = _.uniq(arrData.map( el => moment(el.date).format('DD MMM YYYY')))
        let data = []
        for (const obj of arrData) {
            const material = await MasMaterial.query().where('id', obj.material).last()
            data.push({
                site_id: obj.site_id,
                nm_site: obj.pit.site?.name,
                pit_id: obj.pit_id,
                nm_pit: obj.pit.name,
                shift_id: obj.shift_id,
                nm_shift: obj.shift.name,
                material: obj.material,
                distance: obj.distance,
                tot_ritase: obj.tot_ritase,
                date: moment(obj.date).format('YYYY-MM-DD'),
                actual: parseFloat(obj.tot_ritase) * parseFloat(material.vol)
            })
        }

        const pit = (await MasPit.query().where( w => {
            w.where('sts', 'Y')
            w.where('site_id', req.site_id)
        }).fetch()).toJSON()

        /** GROUPING PIT **/
        data = _.groupBy(data, 'shift_id')
        data = Object.keys(data).map(key => {
            return {
                shift_id: key,
                items: data[key]
            }
        })
        // console.log(data);

        let color = [
            '#7A92E5', 
            '#C1CFFF',
            '#0334E2',
            '#02249E',

            '#E57590',
            '#FFC1D0',
            '#DF0136',
            '#A50329',

            '#EFD781',
            '#FFF0BB',
            '#EBB805',
            '#A98403'
        ]

        for (const [i, obj] of data.entries()) {
            const shift = await MasShift.query().where('id', obj.shift_id).last()
            for (const val of pit) {
                
                var result = [];
                obj.items.filter(el => el.pit_id === val.id).reduce(function(res, value) {
                if (!res[value.date]) {
                    res[value.date] = { date: value.date, actual: 0 };
                    result.push(res[value.date])
                }
                res[value.date].actual += value.actual;
                return res;
                }, {});
                
                
                xresult.push({
                    kode: shift.kode,
                    name: `${shift.name} (${val.kode})`,
                    stack: val.name,
                    group: val.name,
                    type: req.typeChart,
                    items: result
                });

                if(req.typeChart === 'column'){
                    xresult.push({
                        kode: shift.kode,
                        name: `TREND ${shift.kode} (${val.kode})`,
                        stack: val.name,
                        group: val.name,
                        type: 'spline',
                        items: result
                    });
                }
            }
        }
       
        xresult = _.sortBy(xresult, function(num){ return num.stack });
        console.log(xresult);
        
        xresult = xresult.map( (obj, i) => {
            return {
                ...obj,
                color: color[i] || ''
            }
        })
        
        return {
            xAxis: arrDate,
            data: xresult
        }
    }

    async PW_HOURLY (req) {
        console.log(req);
        let result = []
        let data
        if(req.production_type === 'OB'){
            data = (
                await VRitaseObPerjam.query().where( w => {
                    if(req.site_id){
                        w.where('site_id', req.site_id)
                    }
                    w.where('tglx', req.date)
                }).fetch()
            ).toJSON()
        }else{
            data = (
                await VRitaseCoalPerjam.query().where( w => {
                    if(req.site_id){
                        w.where('site_id', req.site_id)
                    }
                    w.where('tglx', req.date)
                }).fetch()
            ).toJSON()
        }

        console.log(data);

        data = _.groupBy(data, 'pit_id')
        data = Object.keys(data).map(key => {
            return {
                pit_id: key,
                items: data[key]
            }
        })

        /** GENERATE xAxis DATA **/
        let xAxis = []
        for (let i = 0; i < 24; i++) {
            var str = '0'.repeat(2 - `${i}`.length) + i
            xAxis.push("Pukul " + str)
        }

        let color = req.colorGraph
        for (const [i, obj] of data.entries()) {
            
            var arrData = [];

            const pit = await MasPit.query().where('id', obj.pit_id).last()

            /** GROUPING DATA BY WAKTU **/
            obj.items.reduce(function(res, value) {
              if (!res[value.jamx]) {
                res[value.jamx] = { jamx: value.jamx, vol: 0 };
                arrData.push(res[value.jamx])
              }
              res[value.jamx].vol += value.vol;
              return res;
            }, {});

            for (let i = 0; i < 24; i++) {
                var str = '0'.repeat(2 - `${i}`.length) + i
                if(!arrData.map(el => el.jamx).includes(str)){
                    arrData.push({
                        jamx: str,
                        vol: 0
                    })
                }
            }

            arrData = _.sortBy(arrData, 'jamx');
            arrData = arrData.map(el => {
                return {
                    pukul: el.jamx + ':00',
                    actual: el.vol
                }
            })

            console.log(i);

            result.push({
                pit_id: obj.pit_id,
                name: `${pit.name} (${pit.kode})`,
                stack: pit.kode,
                type: req.typeChart,
                color: color[i],
                items: arrData
            })

            if(req.typeChart === 'column'){
                result.push({
                    pit_id: obj.pit_id,
                    name: `TREND ${pit.kode}`,
                    stack: pit.kode,
                    type: 'spline',
                    color: color[i],
                    items: arrData
                })
            }
        }
        // console.log(result);
        return {
            xAxis: xAxis,
            data: result
        }
    }
}
module.exports = new repPoduction()

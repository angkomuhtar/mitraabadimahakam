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
const VRitaseObPerjam = use("App/Models/VRitaseObPerjam")

class repPoduction {
    async MW_MONTHLY (req) {
        console.log('startMonth', req);
        let result = []
        // let startMonth = req.month_begin ? moment(req.month_begin).startOf('month').format('YYYY-MM-DD') : moment().startOf('year').format('YYYY-MM-DD')
        // let endMonth = req.month_end ? moment(req.month_end).endOf('month').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
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
                    w.where('tipe', req.production_type)
                    w.where('month', '>=', moment(req.month_begin).startOf('month').format('YYYY-MM-DD'))
                    w.where('month', '<=', moment(req.month_end).endOf('month').format('YYYY-MM-DD'))
                }).orderBy('month').fetch()
            ).toJSON()

            let xAxis = data.map(el => moment(el.month).format('MMM YYYY'))

            let estimate  = data.map( el => {
                return {
                        volume: el.estimate,
                        nm_pit: el.pit.name,
                        nm_site: el.pit.site.name,
                }
            })

            estimate = _.groupBy(estimate, 'nm_pit')
            estimate = Object.keys(estimate).map(key => {
                return {
                    nm_pit: `Target (${key})`,
                    type: 'column',
                    color: '#75A5E3',
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
                    type: 'column',
                    color: '#015CB1',
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
                    color: 'red',
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
        let result = []
        var x = moment(req.week_begin).week()
        var y = moment(req.week_end).week()
        // console.log(x, y);

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

        let xAxis = arrDate.map(el => el.date)

        let tmpActual = []
        let tmpTarget = []
        let tmpTrands = []

        req.production_type = req.production_type != 'OB' ? 'COAL' : 'OB'

        for (const obj of arrDate) {
            let planActual = await DailyPlan.query().where( w => {
                if(req.production_type){
                    w.where('tipe', req.production_type)
                }
                w.where('current_date', '>=', _.first(obj.items))
                w.where('current_date', '<=', _.last(obj.items))
            }).select('actual').getSum('actual')

            let planTarget = await DailyPlan.query().where( w => {
                if(req.production_type){
                    w.where('tipe', req.production_type)
                }
                w.where('current_date', '>=', _.first(obj.items))
                w.where('current_date', '<=', _.last(obj.items))
            }).select('estimate').getSum('estimate')

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
                color: "#75A5E3",
                type: 'column',
                items: tmpTarget[key]
            }
        })
        tmpActual = _.groupBy(tmpActual, 'nm_pit')
        tmpActual = Object.keys(tmpActual).map(key => {
            return {
                nm_pit: key,
                color: "#015CB1",
                type: 'column',
                items: tmpActual[key]
            }
        })
        tmpTrands = _.groupBy(tmpTrands, 'nm_pit')
        tmpTrands = Object.keys(tmpTrands).map(key => {
            return {
                nm_pit: key,
                color: "red",
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

        req.production_type = req.production_type != 'OB' ? 'COAL' : 'OB'

        let planDaily 
        try {
            planDaily = (await DailyPlan.query().where( w => {
                if(req.production_type){
                    w.where('tipe', req.production_type)
                }
                w.where('pit_id', req.pit_id)
                w.where('current_date', '>=', req.start_date)
                w.where('current_date', '<=', req.end_date)
            }).fetch()).toJSON()
        } catch (error) {
            console.log(error);
        }


        let xAxis = planDaily.map(el => moment(el.current_date).format('DD-MM-YYYY'))

        let arrTarget = []
        let arrActual = []
        let arrTrands = []
        for (const el of planDaily) {
            const pit = await MasPit.query().where('id', el.pit_id).last()
            arrTarget.push({
                site_id: el.site_id,
                pit_id: el.pit_id,
                kd_pit: pit.kode,
                nm_pit: `Target ${pit.name}`,
                current_date: moment(el.current_date).format('DD-MM-YYYY'),
                volume: el.estimate
            })
            arrActual.push({
                site_id: el.site_id,
                pit_id: el.pit_id,
                kd_pit: pit.kode,
                nm_pit: `Actual ${pit.name}`,
                current_date: moment(el.current_date).format('DD-MM-YYYY'),
                volume: el.actual
            })
            arrTrands.push({
                site_id: el.site_id,
                pit_id: el.pit_id,
                kd_pit: pit.kode,
                nm_pit: `Trends ${pit.name}`,
                current_date: moment(el.current_date).format('DD-MM-YYYY'),
                volume: el.actual
            })
        }

        arrTarget = _.groupBy(arrTarget, 'nm_pit')
        arrTarget = Object.keys(arrTarget).map(key => {
            return {
                nm_pit: key,
                color: "#75A5E3",
                type: 'column',
                items: arrTarget[key]
            }
        })
        arrActual = _.groupBy(arrActual, 'nm_pit')
        arrActual = Object.keys(arrActual).map(key => {
            return {
                nm_pit: key,
                color: "#015CB1",
                type: 'column',
                items: arrActual[key]
            }
        })
        arrTrands = _.groupBy(arrTrands, 'nm_pit')
        arrTrands = Object.keys(arrTrands).map(key => {
            return {
                nm_pit: key,
                color: "red",
                type: 'spline',
                items: arrTrands[key]
            }
        })

        let x = [...arrTarget, ...arrActual, ...arrTrands]

        console.log(JSON.stringify(x, null, 2));
        return {
            xAxis: xAxis,
            data: [...arrTarget, ...arrActual, ...arrTrands]
        }
    }

    async MW_SHIFTLY (req) {
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
                // color: "#75A5E3",
                type: 'column',
                items: arrTarget[key]
            }
        })
        arrActual = _.groupBy(arrActual, 'nm_pit')
        arrActual = Object.keys(arrActual).map(key => {
            return {
                nm_pit: key,
                stack: 'actual',
                // color: "#015CB1",
                type: 'column',
                items: arrActual[key]
            }
        })
        arrTrands = _.groupBy(arrTrands, 'nm_pit')
        arrTrands = Object.keys(arrTrands).map(key => {
            return {
                nm_pit: key,
                stack: 'trands',
                color: "red",
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

        let startHour = moment(req.date).startOf('day').format('YYYY-MM-DD HH:mm')
        let endHour = moment(req.date).endOf('day').format('YYYY-MM-DD HH:mm')
        var arrHours = getHoursArray(startHour, endHour)
        
        let arrRitaseId = (await DailyRitase.query().where( w => {
            w.where('pit_id', req.pit_id)
            w.where('date', req.date)
        }).fetch()).toJSON().map(el => el.id)
        

        let data = []
        for (const obj of arrHours) {
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
                jamx: 'Pukul ' + key,
                sum_volume: parseFloat(grouping[key][0].vol) * parseFloat(grouping[key].length),
                items: grouping[key]
            }
        })
        
        grouping = _.sortBy(grouping, 'date')

        let xAxis = grouping.map(el => el.jamx)


        /** GET TARGET PERJAM **/
        const dailyPlan = await DailyPlan.query().where( w => {
            w.where('tipe', req.production_type)
            w.where('current_date', req.date)
            w.where('pit_id', req.pit_id)
        }).last()

        let target = dailyPlan.toJSON().estimate / 22

        result = grouping.map(el => {
            return {
                ...el,
                name: el.jamx,
                target: target
            }
        })
        
        let resultx = [
            {name: 'Target', type: 'column', stack: 'tgt', color: '#015CB1', items: result.map(el => {
                return {
                    volume: el.target
                }
            })},
            {name: 'Actual', type: 'column', stack: 'act', color: '#75A5E3', items: result.map(el => {
                return {
                    volume: el.sum_volume
                }
            })},
            {name: 'Trands', type: 'spline', stack: 'act', color: 'red', items: result.map(el => {
                return {
                    volume: el.sum_volume
                }
            })}
        ]

        return {
            xAxis: xAxis,
            data: resultx
        }
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
                    type: 'column',
                    items: result[key]
            }
        })

        let xAxis = _.groupBy(data, 'xAxis')
        xAxis = Object.keys(xAxis).map(key => {
            return {
                x_axis: key
            }
        })

        const site = await MasSite.query().where('id', req.site_id).last()
        // site_nm: site.name,

        return {
            site_nm: site.name,
            xAxis: xAxis.map( el => el.x_axis),
            data: result
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

        result = _.groupBy(result, 'nm_pit')
        result = Object.keys(result).map(key => {
            return {
                nm_pit: key,
                type: 'column',
                items: result[key]
            }
        })

        const site = await MasSite.query().where('id', req.site_id).last()

        return {
            site_nm: site.name,
            xAxis: arrDate.map( el => el.date),
            data: result
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

        result = _.groupBy(result, 'nm_pit')
        result = Object.keys(result).map(key => {
            return {
                nm_pit: key,
                items: result[key]
            }
        })

        return {
            xAxis: arrDate,
            data: result
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
                w.where('date', '>=', moment(req.start_date).format('YYYY-MM-DD'))
                w.where('date', '<=', moment(req.end_date).format('YYYY-MM-DD'))
            }).fetch()
        ).toJSON()
        
        console.log(arrData);

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

        for (const obj of data) {
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
                    // shift_id: obj.shift_id,
                    name: `${shift.name} (${val.kode})`,
                    stack: val.name,
                    group: val.name,
                    items: result
                });
            }
        }

        xresult = _.sortBy(xresult, function(num){ return num.stack });
        console.log(JSON.stringify(xresult, null, 2))
        return {
            xAxis: arrDate,
            data: xresult
        }
    }

    async PW_HOURLY (req) {
        console.log(req);
        let result = []
        let data = (
            await VRitaseObPerjam.query().where( w => {
                if(req.site_id){
                    w.where('site_id', req.site_id)
                }
                w.where('tglx', req.date)
            }).fetch()
        ).toJSON()

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

        for (const obj of data) {
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

            result.push({
                pit_id: obj.pit_id,
                name: `${pit.name} (${pit.kode})`,
                stack: pit.kode,
                items: arrData
            })
        }
        // console.log(result);
        return {
            xAxis: xAxis,
            data: result
        }
    }

    /** GENERATE DATA PDF **/
    async MONTHLY_OB_PDF (req) {

    }
}
module.exports = new repPoduction()

// [
//     {
//       name: "DAY SHIFT",
//       stack: "DERAWAN BARU",
//       data: [6468, 8074]
//     },
//     {
//       name: "NIGHT SHIFT",
//       stack: "DERAWAN BARU",
//       data: [6270, 4378]
//     },
//     {
//       name: "DAY SHIFT",
//       stack: "KARIMATA",
//       data: [10560, 10472]
//     },
//     {
//       name: "NIGHT SHIFT",
//       stack: "KARIMATA",
//       data: [11770, 10890]
//     },
//     {
//       name: "DAY SHIFT",
//       stack: "RPU",
//       data: [12540, 13266]
//     },
//     {
//       name: "NIGHT SHIFT",
//       stack: "RPU",
//       data: [10142, 9680]
//     }
// ]
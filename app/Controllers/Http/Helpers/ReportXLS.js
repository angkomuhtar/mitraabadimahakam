'use strict'

const fs = require('fs')
const XLSX = require("xlsx")
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require('moment')
const DailyFleet = use("App/Models/DailyFleet")
const DailyRitase = use("App/Models/DailyRitase")
const MamFuelRatio = use("App/Models/MamFuelRatio")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")
const MonthlyPlan = use("App/Models/MonthlyPlan")
const DailyPlan = use("App/Models/DailyPlan")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")
const MasShift = use("App/Models/MasShift")
const MasMaterial = use("App/Models/MasMaterial")
const VRitaseObPerjam = use("App/Models/VRitaseObPerjam")
const Image64Helpers = use("App/Controllers/Http/Helpers/_EncodingImage")


class XLSReport {

    async MONTHLY_XLS (req) {

        let filename = `${req.production_type}-${req.range_type}-${req.filterType}-SITE${req.site_id}-${moment().format('DDMMYYYY')}.xlsx`

        if(req.pit_id === 'undefined' || req.pit_id === 'null'){
            req.pit_id = null
        }

        let monthlyPlan
        try {
            monthlyPlan = (
                await MonthlyPlan.query()
                .with('daily_plan')
                .where( w => {
                    if(req.pit_id){
                        w.where('pit_id', req.pit_id)
                    }
                    w.where('site_id', req.site_id)
                    w.where('tipe', req.production_type)
                    w.where('month', '>=', moment(req.month_begin).startOf('month').format('YYYY-MM-DD'))
                    w.where('month', '<=', moment(req.month_end).endOf('month').format('YYYY-MM-DD'))
                }).orderBy([{ column: 'pit_id'}, { column: 'month' }]).fetch()
            ).toJSON()
        } catch (error) {
            console.log(error);
        }

        
        (async() => {

            let data = []
            let details = []

            for (const row of monthlyPlan) {
                const site = await MasSite.query().where('id', row.site_id).last()
                const pit = await MasPit.query().where('id', row.pit_id).last()
                data.push({
                    kd_site: site.kode,
                    nm_site: site.name,
                    kd_pit: pit.kode,
                    nm_pit: pit.name,
                    periode: moment(row.month).format('MMM YYYY'),
                    tipe: req.production_type,
                    estimate: row.estimate,
                    actual: row.actual,
                    diff: parseFloat(row.actual) - parseFloat(row.estimate)
                })
                for (const obj of row.daily_plan) {
                    const pit_details = await MasPit.query().where('id', obj.pit_id).last()
                    details.push({
                        kd_site: site.kode,
                        nm_site: site.name,
                        kd_pit: pit_details.kode,
                        nm_pit: pit_details.name,
                        date: moment(obj.current_date).format('DD MMM YYYY'),
                        tipe: req.production_type,
                        estimate: obj.estimate,
                        actual: obj.actual,
                        diff: parseFloat(obj.actual) - parseFloat(obj.estimate)
                    })
                }
            }
          
            /* generate worksheet and workbook */
            const worksheet_monthly = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet_monthly, "MONTHLY");

            const worksheet_daily = XLSX.utils.json_to_sheet(details);
            XLSX.utils.book_append_sheet(workbook, worksheet_daily, "DAILY");
          
            /* fix headers */
            XLSX.utils.sheet_add_aoa(worksheet_monthly, [["Kode Site", "Nama Site", "Kode Pit", "Nama Pit", "Periode", "Tipe", "Target", "Actual", "Diff"]], { origin: "A1" });
            XLSX.utils.sheet_add_aoa(worksheet_daily, [["Kode Site", "Nama Site", "Kode Pit", "Nama Pit", "Periode", "Tipe", "Target", "Actual", "Diff"]], { origin: "A1" });

            const fs = require('fs')
            const path = Helpers.publicPath('download/'+filename)
            try {
                fs.unlinkSync(path)
            } catch(err) {
                console.error(err)
            }

            XLSX.writeFile(workbook, Helpers.publicPath('download/'+filename));
        })();
        
        return { uri: 'download/' + filename}
          
    }

    async WEEKLY_XLS(req){
        req.production_type = req.production_type === 'BB' ? 'COAL':'OB'
        let filename = `${req.production_type}-${req.range_type}-${req.filterType}-SITE${req.site_id}-${moment().format('DDMMYYYY')}.xlsx`

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
                date: 'WEEK-'+i,
                items: getDaysBetweenDates(arrStart, arrEnd)
            })
        }
        

        let dataJson = []
        for (const obj of arrDate) {
            let tmp = []

            if(req.pit_id === 'undefined' || req.pit_id === 'null'){
                req.pit_id = null
            }
            
            
            let dataWeekly
            try {
                dataWeekly = (await DailyPlan.query().where( w => {
                    if(req.pit_id){
                        w.where('pit_id', req.pit_id)
                    }
                    w.where('tipe', req.production_type)
                    w.where('current_date', '>=', _.first(obj.items))
                    w.where('current_date', '<=', _.last(obj.items))
                }).orderBy('pit_id').fetch()).toJSON()
            } catch (error) {
                console.log(error);
            }
            
            for (const val of dataWeekly) {
                const pit = await MasPit.query().where('id', val.pit_id).last()
                const site = await MasSite.query().where('id', val.site_id).last()
                tmp.push({
                    site_id: val.site_id,
                    site_kd: site.kode,
                    site_nm: site.name,
                    pit_id: val.pit_id,
                    pit_kd: pit.kode,
                    pit_nm: pit.name,
                    date: moment(val.current_date).format('DD-MM-YYYY'),
                    estimate: val.estimate,
                    actual: val.actual,
                    diff: parseFloat(val.actual) - parseFloat(val.estimate),
                    date: moment(val.current_date).format('YYYY-MM-DD')
                })
            }
            const pit = await MasPit.query().where('id', req.pit_id).last()
            const site = await MasSite.query().where('id', req.site_id).last()
            dataJson.push({
                week: obj.date,
                date_begin: _.first(obj.items),
                date_end: _.last(obj.items),
                estimate: (dataWeekly.reduce((a, b) => { return a + b.estimate }, 0)).toFixed(2),
                actual: (dataWeekly.reduce((a, b) => { return a + b.actual }, 0)).toFixed(2),
                pit_nm: pit?.name || 'ALL PIT',
                site_nm: site.name,
                items: tmp
            })
        }
        console.log(dataJson);

        (async() => {

            let data = []
            let details = []

            for (const row of dataJson) {
                data.push({
                    site: row.site_nm,
                    periode: row.week,
                    range: row.date_begin + ' s/d ' + row.date_end,
                    tipe: req.production_type,
                    estimate: row.estimate,
                    actual: row.actual,
                    diff: parseFloat(row.actual) - parseFloat(row.estimate)
                })
                console.log(row.items);
                for (const obj of row.items) {
                    const pit_details = await MasPit.query().where('id', obj.pit_id).last()
                    details.push({
                        nm_site: obj.site_nm,
                        kd_pit: pit_details.kode,
                        nm_pit: pit_details.name,
                        date: moment(obj.date).format('DD MMM YYYY'),
                        tipe: req.production_type,
                        estimate: obj.estimate,
                        actual: obj.actual,
                        diff: parseFloat(obj.actual) - parseFloat(obj.estimate)
                    })
                }
            }
            
          
            /* generate worksheet and workbook */
            const worksheet_weekly = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet_weekly, "WEEKLY");

            const worksheet_daily = XLSX.utils.json_to_sheet(details);
            XLSX.utils.book_append_sheet(workbook, worksheet_daily, "DAILY");
          
            /* fix headers */
            XLSX.utils.sheet_add_aoa(worksheet_weekly, [_.keys(data[0])], { origin: "A1" });
            XLSX.utils.sheet_add_aoa(worksheet_daily, [_.keys(details[0])], { origin: "A1" });

            const fs = require('fs')
            const path = Helpers.publicPath('download/'+filename)
            try {
                fs.unlinkSync(path)
                //file removed
            } catch(err) {
                console.error(err)
            }
            XLSX.writeFile(workbook, Helpers.publicPath('download/'+filename));
        })();
        
        return { uri: 'download/' + filename}

        
    }

    async DAILY_XLS(req){

        if(req.pit_id === 'undefined' || req.pit_id === 'null'){
            req.pit_id = null
        }

        const dataDaily = (await DailyPlan.query().where( w => {
            if(req.pit_id){
                w.where('pit_id', req.pit_id)
            }
            w.where('tipe', 'OB')
            w.where('current_date', '>=', req.start_date)
            w.where('current_date', '<=', req.end_date)
        }).orderBy([{ column: 'pit_id', order: 'asc' }, { column: 'current_date', order: 'asc' }]).fetch()).toJSON()

        // console.log(dataDaily);

        
    }

    async SHIFTLY_XLS(req) {
        console.log('shiftly====================================');
        console.log(req);
        // console.log(img);
        console.log('====================================');

        let arrData
        try {
            arrData = (
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
        } catch (error) {
            console.log(error);
        }
        
        // console.log(arrData);
        let data = []
        for (const obj of arrData) {
            const material = await MasMaterial.query().where('id', obj.material).last()
            // console.log(moment(obj.date).format('YYYY-MM-DD'));
            // console.log(obj.pit.name);
            data.push({
                site_id: obj.site_id,
                nm_site: obj.pit.site?.name,
                pit_id: obj.pit_id,
                nm_pit: obj.pit.name,
                shift_id: obj.shift_id,
                nm_shift: obj.shift.name,
                kd_shift: obj.shift.kode,
                date: moment(obj.date).format('YYYY-MM-DD'),
                actual: parseFloat(obj.tot_ritase) * parseFloat(material.vol)
            })
        }
        data = _.groupBy(_.sortBy(data, 'nm_pit'), 'nm_pit')
        data = Object.keys(data).map(key => {
            return {
                nm_pit: key,
                items: data[key]
            }
        })

        let tmp = []
        for (const obj of data) {
            let itemx = []
            for (const val of obj.items) {
                const target = await DailyPlan.query().where( w => {
                    w.where('current_date', val.date)
                    w.where('pit_id', val.pit_id)
                }).last()

                var estimasi = parseFloat(target.estimate) / 2
                var diff = parseFloat(val.actual) - (parseFloat(target.estimate) / 2)
                itemx.push({
                    ...val, 
                    estimate: estimasi.toFixed(2),
                    diff: diff.toFixed(2)
                })
            }

            tmp.push({
                ...obj, 
                items: itemx
            })
        }
    }

    async HOURLY_XLS(req) {
        console.log(req);
        let resultx = []
        let result = []
        let data 
        try {
            data = (
                await VRitaseObPerjam.query().where( w => {
                    if(req.site_id){
                        w.where('site_id', req.site_id)
                    }
                    w.where('tglx', req.date)
                }).fetch()
            ).toJSON()
        } catch (error) {
            console.log(error);
        }

        data = _.groupBy(data, 'pit_id')
        data = Object.keys(data).map(key => {
            return {
                pit_id: key,
                items: data[key]
            }
        })

        // let color = ['#75A5E3', '#1873C8', '#014584']
        for (const [i, obj] of data.entries()) {
            
            var arrData = [];

            const pit = await MasPit.query().where('id', obj.pit_id).last()

            /** GROUPING DATA BY WAKTU **/
            obj.items.reduce(function(res, value) {
              if (!res[value.jamx]) {
                res[value.jamx] = { jamx: value.jamx, nm_pit: pit.name, vol: 0 };
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
                        nm_pit: pit.name,
                        vol: 0
                    })
                }
            }

            arrData = _.sortBy(arrData, 'jamx');
            arrData = arrData.map(el => {
                return {
                    pukul: el.jamx + ':00',
                    date: moment(req.date).format('DD MMM YYYY'),
                    nm_pit: pit.name,
                    actual: el.vol
                }
            })

            // console.log(obj);
            console.log(arrData);
            resultx.push({
                pit_id: obj.pit_id,
                pit_nm: pit.name,
                actual: arrData.reduce((a, b) => {return a + b.actual}, 0),
                items: arrData
            })
        }
    }

    /* FUEL RATIO XLS */
    async PIT_FUEL_RATIO_XLS (req) {
        console.log('PIT-WISE REQ ::', req);
        let filename = `FUEL_RATIO-${req.range_type.toUpperCase()}-${req.inp_ranges.toUpperCase()}-SITE${req.site_id}${req.pit_id}-${moment().format('DDMMYYYY')}.xlsx`
        let data = []
        console.log(filename);
        try {
            data = (
                await MamFuelRatio.query().where( w => {
                    w.where('site_id', req.site_id)
                    w.where('pit_id', req.pit_id)
                    w.where('date', '>=', req.start)
                    w.where('date', '<=', req.end)
                }).fetch()
            ).toJSON()
            
        } catch (error) {
            console.log(error);
        }


        (async() => {

            let PREP_DATA = []

            for (const [i, obj] of data.entries()) {
                var no = i + 1
                const site = await MasSite.query().where('id', obj.site_id).last()
                const pit = await MasPit.query().where('id', obj.pit_id).last()
                PREP_DATA.push({
                    No: no,
                    NamaSite: site.name,
                    NamaPit: pit.name,
                    Tanggal: moment(obj.date).format('DD-MM-YYYY'),
                    VolOB: obj.ob,
                    VolCoalMT: obj.coal_mt,
                    VolCoalBCM: obj.coal_bcm,
                    FuelUsed: obj.fuel_used,
                    FuelRatio: obj.fuel_ratio
                })
            }

            /* generate worksheet and workbook */
            const worksheet_weekly = XLSX.utils.json_to_sheet(PREP_DATA);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet_weekly, "DAILY");
          
            /* fix headers */
            XLSX.utils.sheet_add_aoa(worksheet_weekly, [_.keys(PREP_DATA[0])], { origin: "A1" });
            
            const path = Helpers.publicPath('download/'+filename)
            try {
                console.log(fs.existsSync(path));
                if (fs.existsSync(path)) {
                    fs.unlinkSync(path)
                    // file removed
                }
            } catch(err) {
                console.error(err)
            }
            XLSX.writeFile(workbook, path);
        })();
        
        return { uri: 'download/' + filename}

    }

    async PERIODE_FUEL_RATIO_XLS (req) {
        console.log('PERIODE-WISE REQ ::', req);
        let filename = `FUEL_RATIO-${req.range_type.toUpperCase()}-${req.inp_ranges.toUpperCase()}-SITE${req.site_id}-ALLPIT-${moment().format('DDMMYYYY')}.xlsx`
        console.log(filename);
        let PREP_DATA = []

        if(req.inp_ranges === 'date'){
            const data = (
                await MamFuelRatio.query().where( w => {
                    w.where('site_id', req.site_id)
                    w.where('date', '>=', req.start)
                    w.where('date', '<=', req.end)
                }).fetch()
            ).toJSON()

            let groupingPIT = _.groupBy(data, 'pit_id')
            groupingPIT = Object.keys(groupingPIT).map(key => {
                return {
                    pit_id: key,
                    items: groupingPIT[key]
                }
            })

            console.log(groupingPIT);

            for (const obj of groupingPIT) {
                for (const val of obj.items) {
                    const pit = await MasPit.query().where('id', obj.pit_id).last()
                    PREP_DATA.push({
                        NamaPit: pit.name,
                        Tanggal: moment(val.date).format('DD-MM-YYYY'),
                        VolOB: val.ob,
                        VolCoalMT: val.coal_mt,
                        VolCoalBCM: val.coal_bcm,
                        FuelUsed: val.fuel_used,
                        FuelRatio: val.fuel_ratio
                    })
                }
            }

            
        }

        if(req.inp_ranges === 'week'){
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

            const pit = (
                await MasPit.query().where( w => {
                    w.where('sts', 'Y')
                    w.where('site_id', req.site_id)
                }).fetch()
            ).toJSON()

            for (const val of pit) {
                for (const [i, elm] of arrDate.entries()) {
                    
                    const sumOB = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('ob')

                    const sumCoalMT = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('coal_mt')

                    const sumCoalBCM = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('coal_bcm')

                    const sumFuel = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', _.first(elm.items))
                        w.where('date', '<=', _.last(elm.items))
                    }).getSum('fuel_used')

                    PREP_DATA.push({
                        pit_id: val.id,
                        NamaPit: val.name,
                        Week: elm.date,
                        Tanggal: elm.items[i],
                        VolOB: sumOB,
                        VolCoalMT: sumCoalMT,
                        VolCoalBCM: sumCoalBCM,
                        FuelUsed: sumFuel,
                        FuelRatio: (sumOB + (sumCoalMT + sumCoalBCM)) / sumFuel
                    });
                }
            }
        }

        if(req.inp_ranges === 'month'){
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

            const pit = (
                await MasPit.query().where( w => {
                    w.where('sts', 'Y')
                    w.where('site_id', req.site_id)
                }).fetch()
            ).toJSON()

            console.log(arrMonth);
            for (const val of pit) {
                for (const elm of arrMonth) {
                    const sumOB = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                        w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                    }).getSum('ob') || 0

                    const sumCoalMT = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                        w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                    }).getSum('coal_bcm') || 0

                    const sumCoalBCM = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                        w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                    }).getSum('coal_bcm') || 0

                    const sumFuel = await MamFuelRatio.query().where( w => {
                        w.where('pit_id', val.id)
                        w.where('date', '>=', moment(elm).startOf('month').format('YYYY-MM-DD'))
                        w.where('date', '<=', moment(elm).endOf('month').format('YYYY-MM-DD'))
                    }).getSum('fuel_used') || 0

                    PREP_DATA.push({
                        pit_id: val.id,
                        NamaPit: val.name,
                        Periode: elm,
                        VolOB: sumOB,
                        VolCoalMT: sumCoalMT,
                        VolCoalBCM: sumCoalBCM,
                        FuelUsed: sumFuel,
                        FuelRatio: (sumOB + (sumCoalMT + sumCoalBCM)) / sumFuel
                    });
                }
            }
        }

        (async() => {
    
            /* generate worksheet and workbook */
            const worksheet_weekly = XLSX.utils.json_to_sheet(PREP_DATA);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet_weekly, "DAILY");
          
            /* fix headers */
            XLSX.utils.sheet_add_aoa(worksheet_weekly, [_.keys(PREP_DATA[0])], { origin: "A1" });
            
            const path = Helpers.publicPath('download/'+filename)
            try {
                console.log(fs.existsSync(path));
                if (fs.existsSync(path)) {
                    fs.unlinkSync(path)
                    // file removed
                }
            } catch(err) {
                console.error(err)
            }
            XLSX.writeFile(workbook, path);
        })();
        
        return { uri: 'download/' + filename}
        
    }
}

module.exports = new XLSReport()

'use strict'

const moment = require('moment')
const MasEvent = use("App/Models/MasEvent")
const DailyRitase = use("App/Models/DailyRitase")
const VRitaseObPerjam = use("App/Models/VRitaseObPerjam")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")


class PDFReport {
    async RIT_PER_JAM(start, end){

        const jumlahData = (await VRitaseObPerjam.query()
        .with('dailyritase')
        .with('hauler')
        .where(w => {
            w.where('check_in', '>=', `${start}`)
            w.where('check_in', '<=', `${end}`)
        })
        .orderBy([{ column: 'check_in', order: 'desc' }, { column: 'exca_id', order: 'asc' }])
        .fetch()).toJSON()

        let result = jumlahData.map(item => {
            return {
                exca_unit: item.kode,
                jarak: item.distance,
                volume: item.vol,
                hauler_unit: item.hauler.kode,
                jum: 1,
            }
        })

        result = result.reduce(function (obj, item) {
            obj[item.exca_unit] = obj[item.exca_unit] || [];
            obj[item.exca_unit].push({
                jarak: item.jarak,
                volume: item.volume,
                hauler_unit: item.hauler_unit,
                rit: 1
            });    
            return obj;
        }, {});
  
        result = Object.keys(result).map(function (key) {    
          return {exca_unit: key, details: result[key]}
        });

        return result

        // for (let index = 0; index < 24; index++) {
        //     var len = '0'.repeat(2 - `${index}`.length)
        //     var begin = `${moment(date).format('YYYY-MM-DD')} ${len}${index}:00`
        //     var end = `${moment(date).format('YYYY-MM-DD')} ${len}${index}:59`

        //     const jumlahData = (await VRitaseObPerjam.query()
        //     .with('dailyritase')
        //     .with('hauler')
        //     .where(w => {
        //         w.where('check_in', '>=', `${begin}`)
        //         w.where('check_in', '<=', `${end}`)
        //     })
        //     .fetch()).toJSON()
        //     // console.log(jumlahData);
        //     durations.push({
        //         group: `Pukul ${len}${index}:00`,
        //         details: jumlahData.length > 0 ? await Promise.all(jumlahData.map(async (item) => {
        //             const data = (await DailyRitaseDetail.query().with('daily_ritase', unit => unit.with('unit')).where('id', item.id).last()).toJSON()
        //             // console.log(data.daily_ritase.unit.kode);
        //             return {
        //                 excavator: data.daily_ritase.unit.kode,
        //                 ritase: jumlahData.length
        //             }
        //         })) : ''
        //     })
        // }
        // console.log(JSON.stringify(durations, null, 3));
    }
}

module.exports = new PDFReport()
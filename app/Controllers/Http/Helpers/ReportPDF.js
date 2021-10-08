'use strict'

const moment = require('moment')
const MasEvent = use("App/Models/MasEvent")
const DailyRitase = use("App/Models/DailyRitase")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")


class PDFReport {
    async RIT_PER_JAM(){
        
        let date = new Date('2021-10-05')
        let durations = []

        for (let index = 0; index < 24; index++) {
            var len = '0'.repeat(2 - `${index}`.length)
            var begin = `${moment(date).format('YYYY-MM-DD')} ${len}${index}:00`
            var end = `${moment(date).format('YYYY-MM-DD')} ${len}${index}:59`

            const jumlahData = (await DailyRitaseDetail.query()
            .with('daily_ritase', unit => unit.with('unit'))
            .where(w => {
                w.where('check_in', '>=', `${begin}`)
                w.where('check_in', '<=', `${end}`)
            })
            .fetch()).toJSON()
            durations.push({
                group: `Pukul ${len}${index}:00`,
                // details: jumlahData.map(item => item.id)
                details: jumlahData.length > 0 ? await Promise.all(jumlahData.map(async (item) => {
                    const data = (await DailyRitaseDetail.query().with('daily_ritase', unit => unit.with('unit')).where('id', item.id).last()).toJSON()
                    // console.log(data.daily_ritase.unit.kode);
                    return {
                        excavator: data.daily_ritase.unit.kode,
                        ritase: jumlahData.length
                    }
                })) : ''
            })
        }
        console.log(JSON.stringify(durations, null, 3));
    }
}

module.exports = new PDFReport()
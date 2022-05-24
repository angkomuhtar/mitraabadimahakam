'use strict'
const { performance } = require('perf_hooks')
const diagnoticTime = use('App/Controllers/Http/customClass/diagnoticTime')
const EquipmentPerformance = use('App/Models/MamEquipmentPerformance')
const MasEquipment = use('App/Models/MasEquipment')
const moment = require('moment')

class MamEquipmentPerformance {
  // async index({ request }) {
  //     const data = await EquipmentPerformance.query().fetch()
  //     return {
  //         msg : 'test',
  //         data : data
  //     }
  // }

  async index({ request, auth }) {
    const req = request.all()

    const { month } = req

    let user = null

    // user validation
    try {
      user = await auth.authenticator('jwt').getUser()
    } catch (err) {
      return {
        error: true,
        message: err.message,
        validation: 'You are not authorized !',
      }
    }

    // get current month
    const currentMonth = moment(month).startOf('month').format('YYYY-MM-DD')

    // get all production equipment
    const equipments = (
      await MasEquipment.query()
        .where(wh => {
          wh.whereIn('tipe', ['excavator', 'hauler truck', 'water truck'])
          wh.where('aktif', 'Y')
        })
        .fetch()
    ).toJSON()

    // get total hours in month
    const daysInMonth = moment(currentMonth).daysInMonth()
    const getTotalHours = daysInMonth * 24

    // get equipment ids
    const equipmentIds = equipments.map(v => v.id)

    // check wheter is data already in database
    const getData = await EquipmentPerformance.query().where('month', currentMonth).last()
    if (getData) {
      return {
        error: true,
        message: 'Data already in the database !',
      }
    };

    

    // process the data
    for (const equipment of equipmentIds) {
      const newEquipmentPerformance = new EquipmentPerformance()

      newEquipmentPerformance.fill({
        month: currentMonth,
        equip_id: equipment,
        upload_by: user.id,
        mohh: getTotalHours,
        target_downtime_monthly: getTotalHours * (1 - 0 / 100),
      })

      await newEquipmentPerformance.save()

      console.log(`---- equipment id ${equipment} saved to the monthly performance ----`)
    }

    return {
      data: equipmentIds,
    }
  }

  async hourMeterUpload({ request }) {
    return {}
  }
}

module.exports = MamEquipmentPerformance

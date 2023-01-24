'use strict'
const db = use('Database')
const MasSop = use('App/Models/DailyDowntimeEquipment')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const { uniqueId } = require('underscore')
const { uid } = require('uid')
const MasEquipment = use('App/Models/MasEquipment')
const DailyDowntimeEquipment = use('App/Models/DailyDowntimeEquipment')
const EquipmentPerformanceDetails = use('App/Models/MamEquipmentPerformanceDetails')

class MamEquipmentPerformanceDetails {
  async ADD(date, user) {
    // get all production equipment
    const equipments = (
      await MasEquipment.query()
        .where(wh => {
          wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer'])
          wh.where('aktif', 'Y')
        })
        .fetch()
    ).toJSON()

    // get equipment ids
    const equipmentIds = equipments.map(v => v.id)

    // check wheter is data already in database
    const getData = (await EquipmentPerformanceDetails.query()
      .where(wh => {
        wh.where('date', date)
        wh.whereIn('equip_id', equipmentIds)
      })
      .fetch()).toJSON();
      
    if (getData && getData.length > 0) {
      return {
        success: false,
        message: 'Daily Equipment Data already in the database !',
      }
    }

    // process the data
    for (const equipment of equipmentIds) {
      const newEquipmentPerformance = new EquipmentPerformanceDetails()

      newEquipmentPerformance.fill({
        date: date,
        equip_id: equipment,
        upload_by: user.id,
        mohh: 24, // daily
        target_downtime_monthly: 24 * (1 - 0 / 100), // daily
      })
      await newEquipmentPerformance.save()
      console.log(`---- equipment id ${equipment} saved to the daily performance ----`)
    }

    return {
      success: true,
      message: 'Success creating monthly data equipment performance',
    }
  }
}

module.exports = new MamEquipmentPerformanceDetails()

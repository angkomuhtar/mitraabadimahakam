'use strict'
const db = use('Database')
const MasSop = use('App/Models/DailyDowntimeEquipment')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const { uniqueId } = require('underscore')
const { uid } = require('uid')
const MasEquipment = use('App/Models/MasEquipment')
const DailyDowntimeEquipment = use('App/Models/DailyDowntimeEquipment')
const EquipmentPerformance = use('App/Models/MamEquipmentPerformance')

class MamEquipmentPerformance {
  async LIST(req) {
    const limit = req.limit || 25
    const halaman = req.page === undefined ? 1 : parseInt(req.page)
    const SoM = moment(req.date).startOf('month').format('YYYY-MM-DD')

    let equipmentPerformance = (await EquipmentPerformance.query().with('equipment').paginate(halaman, limit)).toJSON()
    equipmentPerformance = {
      ...equipmentPerformance,
      data: equipmentPerformance.data.map(v => {
        return {
          ...v,
          month: moment(v.month).format('MMM YYYY'),
        }
      }),
    }
    return equipmentPerformance
  }

  async SHOW(params) {
    let equipmentPerformance = (await EquipmentPerformance.query().with('equipment').where('id', params.id).first()).toJSON()
    return equipmentPerformance
  }

  async ADD(month, user) {
    // get current month
    const currentMonth = moment(month).startOf('month').format('YYYY-MM-DD')

    // get all production equipment
    //['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer']
    /**
     * [
            'VOLVO 480 D',
            'VOLVO EC950EL',
            'HITACHI ZX870LCH',
            'SANY SY750H',
            'SANY SY365H',
            'DOOSAN DX800LC',
            'SANY SY500H',
            'HYUNDAI R210W-9S',
            'HYUNDAI HX210S',
            'CAT 395',
            'CAT 320GC',
            'CAT 330',
            'D10R',
            'CAT D6GC',
            'CAT D6R2 XL',
            'CAT D9',
            'CAT 14M',
            'SEM 921',
            'SEM 922',
            'CAT 773E',
            'CMT96',
            'A60H',
            'T50',
            'COMPACTOR CS11GC',
            'FUSO FN62',
            'FM260 JD'
          ]
     */
    const equipments = (
      await MasEquipment.query()
        .where(wh => {
          wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer', 'compaq', 'oth'])
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
    const getData = (
      await EquipmentPerformance.query()
        .where(wh => {
          wh.where('month', currentMonth)
          wh.whereIn('equip_id', equipmentIds)
        })
        .fetch()
    ).toJSON()

    if (getData && getData.length > 0) {
      return {
        success: false,
        message: 'Monthly Equipment Data already in the database !',
      }
    }

    // process the data
    for (const equipment of equipmentIds) {
      const newEquipmentPerformance = new EquipmentPerformance()
      const now = moment(month).format('DD MMM')
      const to = moment(month).format('DD MMM')

      newEquipmentPerformance.fill({
        month: currentMonth,
        period: `${now} - ${to}`,
        period_date_start : currentMonth,
        period_date_end : currentMonth,
        equip_id: equipment,
        upload_by: user.id,
        mohh: getTotalHours,
        target_downtime_monthly: getTotalHours * (1 - 0 / 100),
      })



      await newEquipmentPerformance.save()

      console.log(`---- equipment id ${newEquipmentPerformance} saved to the monthly performance ----`)
    }

    return {
      success: true,
      message: 'Success creating monthly data equipment performance',
    }
  }
}

module.exports = new MamEquipmentPerformance()

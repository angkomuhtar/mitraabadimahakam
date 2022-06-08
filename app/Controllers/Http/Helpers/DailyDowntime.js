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
const EquipmentPerformanceDetails = use('App/Models/MamEquipmentPerformanceDetails')
const DailyChecklist = use('App/Models/DailyChecklist')
const EquipmentPerformanceHelpers = use('App/Controllers/Http/Helpers/MamEquipmentPerformance')
const EquipmentPerformanceDetailsHelpers = use('App/Controllers/Http/Helpers/MamEquipmentPerformanceDetails')
const Utils = use('App/Controllers/Http/customClass/utils')
const MasShift = use('App/Models/MasShift')

class DailyDowntime {
  async LIST(req) {
    const limit = req.limit || 25
    const halaman = req.page === undefined ? 1 : parseInt(req.page)
    let dailyDowntime = (await DailyDowntimeEquipment.query().with('equipment').paginate(halaman, limit)).toJSON()
    dailyDowntime = {
      ...dailyDowntime,
      data: dailyDowntime.data.map(v => {
        return {
          ...v,
          breakdown_start: moment(v.breakdown_start).format('YYYY-MM-DD HH:mm'),
          breakdown_finish: moment(v.breakdown_finish).format('YYYY-MM-DD HH:mm'),
          person_in_charge: v.person_in_charge || 'Tidak Ada',
        }
      }),
    }
    return dailyDowntime
  }

  async uploadProcessActivity(req, filePath, user) {
    const sampleSheet = req.sheet || 'DAILY ACTIVITY'
    const xlsx = excelToJson({
      sourceFile: filePath,
      header: 1,
    })

    const data = []
    const currentMonth = moment(req.date).startOf('month').format('YYYY-MM-DD')
    const selectedDate = moment(req.date).format('YYYY-MM-DD')
    const sheetData = xlsx[sampleSheet].slice(5)
    const daysInMonth = moment(currentMonth).daysInMonth()
    const getTotalHours = daysInMonth * 24

    // methods
    const GET_EQUIPMENT_DATA = async (tipe, brand, name) => {
      let result = null
      const equipment = await MasEquipment.query().where('kode', name).last()

      if (equipment) {
        result = equipment.toJSON()
        return result
      } else {
        // const { isSuccess, checkMsg } = await Utils.equipmentCheck(name, brand)
        // return {
        //   success: isSuccess,
        //   message: checkMsg
        // }
        // return {
        //   success: false,
        //   message: `Equipment Unit ${name} tidak di temukan pada master equipment...`
        // }
        throw new Error (`Equipment Unit ${name} tidak di temukan pada master equipment...`)
      }
    }

    // update into equipment performance master
    await EquipmentPerformanceHelpers.ADD(currentMonth, user)
    // await EquipmentPerformanceDetailsHelpers.ADD(selectedDate, user)

    for (const value of sheetData) {
      let hour_start = String(value.J).split(' ')[4] || '00:00:00'
      let hour_finish = String(value.K).split(' ')[4] || '00:00:00'

      const date = moment(value.I).add(1, 'day').format('YYYY-MM-DD')
      const bd_start = moment(`${date} ${hour_start}`).add(3, 'minute').format('YYYY-MM-DD HH:mm:ss')
      const bd_finish = moment(`${date} ${hour_finish}`).add(3, 'minute').format('YYYY-MM-DD HH:mm:ss')

      const obj = {
        uid: `${moment(date).format('YYYYMM.DDHHMM')}.${(await GET_EQUIPMENT_DATA(value.C, value.D, value.B)).kode}`,
        unitName: (await GET_EQUIPMENT_DATA(value.C, value.D, value.B)).id,
        location: value.E,
        problem: value.G,
        action: value.H || 'Belum Ada',
        date: date,
        bd_start: bd_start,
        bd_finish: bd_finish,
        // #TODO : fix this floating number
        total_bd: value.L,
        bd_status: value.M,
        component_group: value.N || null,
        downtime_code: value.O,
        pic: value.P || null
      }
      data.push(obj)

      // checks
      // const { isSuccess, checkMsg } = await Utils.equipmentCheck(value.B, value.D)
      // return {
      //   success: isSuccess,
      //   message: checkMsg,
      // }
    }

    // filter data by date
    const filteredData = data.filter(v => new Date(v.date) >= new Date(req.date) && new Date(v.date) <= new Date(req.date))

    // insert data to the table
    const afterUpload = []
    let count = 0
    for (const data of filteredData) {
      count += 1
      const newDailyDowntime = new DailyDowntimeEquipment()
      newDailyDowntime.fill({
        site_id: req.site_id,
        downtime_code: data.uid,
        equip_id: data.unitName,
        location: data.location || 'tidak diisi',
        problem_reported: data.problem,
        corrective_action: data.action,
        breakdown_start: data.bd_start,
        breakdown_finish: data.bd_finish,
        downtime_total: data.total_bd,
        status: data.bd_status,
        component_group: data.component_group || 'Kosong',
        downtime_status: data.downtime_code,
        person_in_charge: data.pic,
        urut: count
      })

      try {
        await newDailyDowntime.save()
        afterUpload.push(newDailyDowntime.toJSON())
        console.log(`--- inserting data ${data.uid} finished ----`)
      } catch (err) {
        return {
          success: false,
          message: 'failed when inserting data to database. Reason : \n' + err.message,
        }
      }
    }

    // update existing data for equipment performance
    const GET_COUNT_SCHEDULED_BREAKDOWN = async (type, equipId) => {
      let countAll = 0

      if (type === 'SCH') {
        let countSch = afterUpload.filter(v => v.equip_id === equipId && v.downtime_status === 'SCH').length
        countAll += countSch
        return countSch
      }

      if (type === 'UNS') {
        let countUns = afterUpload.filter(v => v.equip_id === equipId && v.downtime_status === 'UNS').length
        countAll += countUns
        return countUns
      }

      if (type === 'ACD') {
        let countAcd = afterUpload.filter(v => v.equip_id === equipId && v.downtime_status === 'ACD').length
        countAll += countAcd
        return countAcd
      }

      if (type === 'ALL') {
        return countAll
      }
    }

    /**
     * DAILY EQUIPMENT PERFORMANCE
     */
    const equipments = (
      await MasEquipment.query()
        .where(wh => {
          wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer'])
          wh.where('aktif', 'Y')
        })
        .fetch()
    ).toJSON()

    for (const eq of equipments) {
      const getLastBudgetPA = await EquipmentPerformance.query()
        .where(wh => {
          wh.where('equip_id', eq.id)
        })
        .first()

      const newEquipmentPerformance = new EquipmentPerformanceDetails()
      const breakdown_hours_scheduled = await GET_COUNT_SCHEDULED_BREAKDOWN('SCH', eq.id)
      const breakdown_hours_unscheduled = await GET_COUNT_SCHEDULED_BREAKDOWN('UNS', eq.id)
      const breakdown_hours_accident = await GET_COUNT_SCHEDULED_BREAKDOWN('ACD', eq.id)
      const breakdown_hours_total = breakdown_hours_scheduled + breakdown_hours_unscheduled + breakdown_hours_accident

      console.log('daily sch >> ', breakdown_hours_scheduled)
      console.log('daily uns >> ', breakdown_hours_unscheduled)
      console.log('daily acd >> ', breakdown_hours_accident)
      console.log('daily total >> ', breakdown_hours_total)

      newEquipmentPerformance.fill({
        budget_pa: getLastBudgetPA?.budget_pa || 0,
        equip_id: eq.id,
        target_downtime_monthly: 24 * (1 - 0 / 100), // daily,
        mohh: 24, // daily
        date: selectedDate,
        breakdown_hours_scheduled: breakdown_hours_scheduled,
        breakdown_hours_unscheduled: breakdown_hours_unscheduled,
        breakdown_hours_accident: breakdown_hours_accident,
        breakdown_hours_total: breakdown_hours_total,
        standby_hours: 0,
        actual_pa: ((24 - breakdown_hours_total) / 24) * 100,
        breakdown_ratio_scheduled: (breakdown_hours_scheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
        breakdown_ratio_unscheduled: (breakdown_hours_unscheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
      })

      await newEquipmentPerformance.save()

      console.log(`---- success insert data daily equipment performance : equip id ${eq.id} ----`)
    }

    /**
     * MONTHLY EQUIPMENT PERFORMANCE
     */
    const equipmentPerformanceData = (
      await EquipmentPerformance.query()
        .where(wh => {
          wh.where('month', currentMonth)
        })
        .fetch()
    ).toJSON()

    for (const value of equipmentPerformanceData) {
      const equipmentPerformance = await EquipmentPerformance.query()
        .where(wh => {
          wh.where('equip_id', value.equip_id)
        })
        .first()

      const breakdown_hours_scheduled = (await GET_COUNT_SCHEDULED_BREAKDOWN('SCH', value.equip_id)) + equipmentPerformance.breakdown_hours_scheduled
      const breakdown_hours_unscheduled = (await GET_COUNT_SCHEDULED_BREAKDOWN('UNS', value.equip_id)) + equipmentPerformance.breakdown_hours_unscheduled
      const breakdown_hours_accident = (await GET_COUNT_SCHEDULED_BREAKDOWN('ACD', value.equip_id)) + equipmentPerformance.breakdown_hours_accident
      const breakdown_hours_total = breakdown_hours_scheduled + breakdown_hours_unscheduled + breakdown_hours_accident

      console.log('sch >> ', breakdown_hours_scheduled)
      console.log('uns >> ', breakdown_hours_unscheduled)
      console.log('acd >> ', breakdown_hours_accident)
      console.log('total >> ', breakdown_hours_total)

      const startDate = moment(equipmentPerformance.month).format('DD MMM')
      const nowDate = moment(selectedDate).format('DD MMM')

      equipmentPerformance.merge({
        period: `${startDate} - ${nowDate}`,
        breakdown_hours_scheduled: breakdown_hours_scheduled,
        breakdown_hours_unscheduled: breakdown_hours_unscheduled,
        breakdown_hours_accident: breakdown_hours_accident,
        breakdown_hours_total: breakdown_hours_total,
        standby_hours: equipmentPerformance.mohh - (equipmentPerformance.work_hours + breakdown_hours_total),
        actual_pa: ((equipmentPerformance.mohh - breakdown_hours_total) / equipmentPerformance.mohh) * 100,
        breakdown_ratio_scheduled: (breakdown_hours_scheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
        breakdown_ratio_unscheduled: (breakdown_hours_unscheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
      })

      await equipmentPerformance.save()

      console.log(`---- success update data equipment performance : equip id ${value.equip_id} ----`)
    }

    return {
      success: true,
      message: 'Succes upload daily downtime',
    }
  }

  /**
   * @description HOUR METER UPLOAD
   */
  async uploadProcessHourMeter(req, filePath, user) {
    const sheet = req.sheet || 'DATABASE'

    const xlsx = excelToJson({
      sourceFile: filePath,
      header: 1
    })

    const data = []
    const sheetData = xlsx[sheet].slice(2)
    const reqDate = moment(req.date).format('YYYY-MM-DD')

    // methods
    const GET_EQUIPMENT_DATA = async (tipe, model, name) => {
      let result = null
      const equipment = await MasEquipment.query().where('kode', name).last()

      if (equipment) {
        result = equipment.toJSON()
      } else {
        // do nothing
        return {
          success: false,
          message: `Equipment ${name} not found in the database!`
        }
      }
      return result
    }

    const GET_STARTING_HOUR_METER_EQUIPMENT = async equipId => {
      let getStartingHourMeterEquipment = await DailyChecklist.query()
        .where(wh => {
          wh.where('tgl', moment(reqDate).startOf('month').format('YYYY-MM-DD'))
          wh.where('unit_id', equipId)
        })
        .last()
      if (!getStartingHourMeterEquipment) {
        getStartingHourMeterEquipment = await DailyChecklist.query()
          .where(wh => {
            wh.where('unit_id', equipId)
          })
          .last()
      }
      return getStartingHourMeterEquipment || 0
    }

    const GET_MTD_HOUR_METER_EQUIPMENT = async equipId => {
      const start = moment(reqDate).startOf('month').format('YYYY-MM-DD')
      const end = moment(reqDate).endOf('month').format('YYYY-MM-DD')
      console.log('EQUIPMENT :::', equipId);
      const equipment = await DailyChecklist.query()
        .where(wh => {
          wh.where('tgl', '>=', start)
          wh.where('tgl', '<=', end)
          wh.where('unit_id', equipId)
        })
        .last()
      return equipment
    }

    if (sheetData.length > 0) {
      for (const value of sheetData) {
        const date = moment(value.B).add(1, 'days').format('YYYY-MM-DD')
        if (date === reqDate) {
          const obj = {
            date: date,
            shift: value.C,
            equipName: value.H,
            equipModel: value.I,
            equipType: value.J,
            hm_start: value.M,
            hm_end: value.N,
            hm_total: value.O
          }
          data.push(obj)
          // checks
          // const { isSuccess, checkMsg } = await Utils.equipmentCheck(obj.equipName, obj.equipModel)
          // return {
          //   success: isSuccess,
          //   message: checkMsg,
          // }
        }
      }

      // insert into equipment performance master
      await EquipmentPerformanceHelpers.ADD(reqDate, user)

      const shifts = (await MasShift.query().fetch()).toJSON()

      // now insert the data to daily timesheet
      for (const value of data) {
        const equipId = (await GET_EQUIPMENT_DATA(value.equipType, value.equipModel, value.equipName))?.id

        let dailyChecklist = new DailyChecklist()
        dailyChecklist.fill({
          user_chk: user.id,
          user_spv: null,
          operator: null,
          unit_id: equipId,
          dailyfleet_id: null,
          description: 'hm upload',
          begin_smu: value.hm_start,
          end_smu: value.hm_end,
          used_smu: value.hm_total,
          tgl: reqDate,
          approved_at: moment(req.date).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        })

        try {
          equipId && await dailyChecklist.save()
          console.log(`---- finished inserting timesheet id ${dailyChecklist.id} ----`)
        } catch (err) {
          return {
            success: false,
            message: 'Failed when inserting timesheet to tb.timesheet .\n Reason : ' + err.message,
            reason: err.message,
          }
        }

        try {
          const SMU_BEGIN = (await GET_STARTING_HOUR_METER_EQUIPMENT(equipId)).begin_smu
          const SMU_MTD = (await GET_MTD_HOUR_METER_EQUIPMENT(equipId))?.end_smu
          const USED_SMU = SMU_MTD - SMU_BEGIN || 0

          /**
           * MONTHLY PERFORMANCE
           */
          // update equipment performance master
          const equipmentPerformance = await EquipmentPerformance.query()
            .where(wh => {
              wh.where('equip_id', equipId)
            })
            .first()

          if (equipmentPerformance) {
            const standby_hours = equipmentPerformance.mohh - (USED_SMU + equipmentPerformance.breakdown_hours_total)
            const actual_pa_non_percentage = equipmentPerformance.actual_pa / 100
            const actual_ma = !USED_SMU
              ? USED_SMU / (USED_SMU + equipmentPerformance.breakdown_hours_total)
              : actual_pa_non_percentage / (actual_pa_non_percentage + equipmentPerformance.breakdown_hours_total)

            equipmentPerformance.merge({
              hm_reading_start: SMU_BEGIN,
              hm_reading_end: SMU_MTD,
              work_hours: USED_SMU,
              actual_eu: (USED_SMU / equipmentPerformance.mohh) * 100 || 0,
              actual_ua: (USED_SMU / (USED_SMU + standby_hours)) * 100 || 0,
              actual_ma: actual_ma * 100 || 0,
              standby_hours: standby_hours,
            })

            await equipmentPerformance.save()
            console.log(`---- finished update hm equipment ${value.equipName} ----`)
          }

          /**
           * DAILY PERFORMANCE
           */
          const dailyEquipPerformance = await EquipmentPerformanceDetails.query()
          .where(wh => {
              wh.where('date', reqDate)
              wh.where('equip_id', equipId)
            })
            .last()

          if (dailyEquipPerformance) {
            const standby_hours = dailyEquipPerformance.mohh - (USED_SMU + dailyEquipPerformance.breakdown_hours_total)
            const actual_pa_non_percentage = dailyEquipPerformance.actual_pa / 100
            const actual_ma = !USED_SMU
              ? USED_SMU / (USED_SMU + dailyEquipPerformance.breakdown_hours_total)
              : actual_pa_non_percentage / (actual_pa_non_percentage + dailyEquipPerformance.breakdown_hours_total)

            dailyEquipPerformance.merge({
              budget_pa: equipmentPerformance?.budget_pa || 0,
              hm_reading_start: SMU_BEGIN,
              hm_reading_end: SMU_MTD,
              work_hours: USED_SMU,
              actual_eu: (USED_SMU / dailyEquipPerformance.mohh) * 100 || 0,
              actual_ua: (USED_SMU / (USED_SMU + standby_hours)) * 100 || 0,
              actual_ma: actual_ma * 100 || 0,
              standby_hours: standby_hours,
            })

            await dailyEquipPerformance.save()
            console.log(`---- finished update hm equipment ${value.equipName} for daily ----`)
          }
        } catch (err) {
          console.log('error update eq.performance ?', err.message)
          return {
            success: false,
            message: 'Failed when updating timesheet to eq.performance .\n Reason : ' + err.message,
            reason: err.message,
          }
        }
      }
      return {
        success: true,
        message: 'Finished upload hour meter.',
      }
    }
  }
}

module.exports = new DailyDowntime()

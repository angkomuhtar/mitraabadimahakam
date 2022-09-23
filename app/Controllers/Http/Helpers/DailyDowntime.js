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
const _ = require('underscore')

class DailyDowntime {
  async LIST(req) {
    const limit = req.limit || 50
    const halaman = req.page === undefined ? 1 : parseInt(req.page)
    console.log(req);
    let dailyDowntime = (
      await DailyDowntimeEquipment.query()
      .with('equipment')
      .where( w => {
        if(req.site_id){
          w.where('site_id', req.site_id)
        }
        if(req.equip_id){
          w.where('equip_id', req.equip_id)
        }
        if(req.downtime_status){
          w.where('downtime_status', req.downtime_status)
        }
        if(req.breakdown_start && req.breakdown_finish){
          w.where('breakdown_start', '>=', req.breakdown_start)
          w.where('breakdown_finish', '<=', req.breakdown_finish)
        }
      })
      .paginate(halaman, limit)
    ).toJSON()
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
    let trx = await db.beginTransaction()

    const sampleSheet = req.sheet || 'DAILY ACTIVITY'
    const xlsx = excelToJson({
      sourceFile: filePath,
      header: {
        rows: 6,
      },
    })

    const data = []
    const currentMonth = moment(req.date).startOf('month').format('YYYY-MM-DD')
    const selectedDate = moment(req.date).format('YYYY-MM-DD')
    const sheetData = xlsx[sampleSheet]
    const daysInMonth = moment(currentMonth).daysInMonth()
    const getTotalHours = daysInMonth * 24

    /**
     * Check Wheter there is equipment performance master data for current month
     */
    const masterEquipmentPerformanceCheck = await EquipmentPerformance.query()
      .where(wh => {
        wh.where('month', moment(selectedDate).startOf('month').format('YYYY-MM-DD'))
      })
      .last()
    console.log('masterEquipmentPerformanceCheck >> ', masterEquipmentPerformanceCheck)

    const monthName = moment(selectedDate).startOf('month').format('MMMM')

    if (!masterEquipmentPerformanceCheck) {
      return {
        success: false,
        message: 'Equipment Performance Bulanan Belum di buat untuk bulan ' + monthName,
      }
    }

    for (const obj of sheetData.filter(kode => kode.B != undefined)) {
      try {
        const validEquipment = await MasEquipment.query().where('kode', obj.B).last()
        if(!validEquipment){
          return {
            success: false,
            message: 'Equipment ' + obj.B + ' tidak ditemukan pada data master Equipment...',
          }
        }
      } catch (error) {
        return {
          success: false,
          message: 'Data ' + obj.B + ' tidak valid...',
        }
      }
    }

    // methods
    const GET_EQUIPMENT_DATA = async (tipe, brand, name) => {
      let result = null

      if (name) {
        const equipment = await MasEquipment.query().where('kode', name).last()
        if (equipment) {
          result = equipment.toJSON()
          return result
        } else {
          throw new Error(`Equipment Unit ${name} tidak di temukan pada master equipment...`)
        }
      }
    }

    try {
      // update into equipment performance master
      // await EquipmentPerformanceHelpers.ADD(currentMonth, user)
      // await EquipmentPerformanceDetailsHelpers.ADD(selectedDate, user)

      for (const value of sheetData) {
        let hour_start = String(value.J).split(' ')[4] || '00:00:00'
        let hour_finish = String(value.K).split(' ')[4] || '00:00:00'
        // console.log(String(value.J).split(' ')[4])
        // console.log(String(value.K).split(' ')[4])
        // console.log('-----------------------')
        const eqName = value.B && value.B.indexOf(' ') === -1 ? value.B.split(' ')[0] : value.B
        const date = moment(value.I).add(1, 'day').format('YYYY-MM-DD')
        const bd_start = moment(`${date} ${hour_start}`).add(3, 'minute').format('YYYY-MM-DD HH:mm:ss')
        const bd_finish = moment(`${date} ${hour_finish}`).add(3, 'minute').format('YYYY-MM-DD HH:mm:ss')

        if(!value.M){
          return {
            success: false,
            message: 'Breakdown status must have values...'
          }
        }

        if(!value.V){
          return {
            success: false,
            message: 'Budget PA must have values...'
          }
        }

        const obj = {
          uid: `${moment(date).format('YYYYMM.DDHHMM')}.${(await GET_EQUIPMENT_DATA(value.C, value.D, value.B))?.kode}` || value.B,
          unitName: (await GET_EQUIPMENT_DATA(value.C, value.D, value.B))?.id || value.B,
          location: value.E,
          problem: value.G,
          action: value.H || 'Belum Ada',
          date: date,
          bd_start: bd_start,
          bd_finish: bd_finish,
          // #TODO : fix this floating number
          total_bd: value.L,
          bd_status: (value.M).toUpperCase(),
          component_group: (value.N)?.toUpperCase() || ' ',
          downtime_code: value.O,
          pic: value.P || null,
          budget_pa: parseFloat(value.V) || 0,
        }
        data.push(obj)
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
          problem_reported: data.problem || 'Tidak Ada',
          corrective_action: data.action || 'Tidak Ada',
          breakdown_start: data.bd_start,
          breakdown_finish: data.bd_finish,
          downtime_total: data.total_bd,
          status: data.bd_status,
          component_group: data.component_group,
          downtime_status: data.downtime_code,
          person_in_charge: data.pic,
          urut: count,
        })

        try {
          await newDailyDowntime.save(trx)
          afterUpload.push(newDailyDowntime.toJSON())
        } catch (err) {
          await trx.rollback()
          return {
            success: false,
            message: 'failed when inserting daily downtime to database. Reason : \n' + err.message,
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
      let equipments = (
        await MasEquipment.query()
          .where(wh => {
            wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer'])
            wh.where('aktif', 'Y')
          })
          .fetch()
      ).toJSON()

      const equipIds = _.uniq([...filteredData.map(v => v.unitName), ...equipments.map(v => v.id)]).map(v => {
        return {
          id: v,
        }
      })

      const GET_BUDGET_PA_EQUIPMENT = equipId => {
        let budgetPA = 0

        for (const value of filteredData) {
          if (value.unitName === equipId) {
            budgetPA = value.budget_pa
          }
        }

        console.log(`budget PA EQ ID :: ${equipId} >> ${budgetPA}`)

        return budgetPA
      }

      console.log('equip ids >> ', equipIds)
      for (const eq of equipIds) {
        const SoM = moment(selectedDate).startOf('month').format('YYYY-MM-DD')
        let prevDate = null
        if (selectedDate.split('-')[2] === '01') {
          prevDate = moment(selectedDate).format('YYYY-MM-DD')
        } else {
          prevDate = moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD')
        }

        let getLastBudgetPA = await EquipmentPerformance.query()
          .where(wh => {
            wh.where('equip_id', eq.id)
            wh.where('period_date_start', SoM)
            wh.where('period_date_end', prevDate)
          })
          .last()

        if (!getLastBudgetPA) {
          getLastBudgetPA = await EquipmentPerformance.query()
            .where(wh => {
              wh.where('equip_id', eq.id)
              wh.where('period_date_start', SoM)
            })
            .last()
        }

        let newEquipmentPerformance = null
        const breakdown_hours_scheduled = await GET_COUNT_SCHEDULED_BREAKDOWN('SCH', eq.id)
        const breakdown_hours_unscheduled = await GET_COUNT_SCHEDULED_BREAKDOWN('UNS', eq.id)
        const breakdown_hours_accident = await GET_COUNT_SCHEDULED_BREAKDOWN('ACD', eq.id)
        const breakdown_hours_total = breakdown_hours_scheduled + breakdown_hours_unscheduled + breakdown_hours_accident

        // console.log('daily sch >> ', breakdown_hours_scheduled)
        // console.log('daily uns >> ', breakdown_hours_unscheduled)
        // console.log('daily acd >> ', breakdown_hours_accident)
        // console.log('daily total >> ', breakdown_hours_total)

        const dailyActivityEquipArr = []
        const dailyEquipmentChecks = await EquipmentPerformanceDetails.query()
          .where(wh => {
            wh.where('equip_id', eq.id)
            wh.where('site_id', req.site_id)
            wh.where('date', selectedDate)
          })
          .last()

        if (dailyEquipmentChecks) {
          newEquipmentPerformance = dailyEquipmentChecks.merge({
            site_id: req.site_id,
            budget_pa: getLastBudgetPA?.budget_pa || GET_BUDGET_PA_EQUIPMENT(eq.id) || 0,
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
        } else {
          newEquipmentPerformance = new EquipmentPerformanceDetails()
          newEquipmentPerformance.fill({
            site_id: req.site_id,
            budget_pa: getLastBudgetPA?.budget_pa || GET_BUDGET_PA_EQUIPMENT(eq.id) || 0,
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
        }

        try {
          await newEquipmentPerformance.save(trx)
          dailyActivityEquipArr.push(newEquipmentPerformance.equip_id)
          console.log(`---- success insert data daily equipment performance : equip id ${eq.id} ----`)
        } catch (err) {
          await trx.rollback()
          return {
            success: false,
            message: 'failed when inserting eq.perf details to database. Reason : \n' + err.message,
          }
        }

        // check the timesheet
        try {
          if (dailyActivityEquipArr.length > 0) {
            for (const id of dailyActivityEquipArr) {
              await this.timesheetChecks(id, selectedDate, req.site_id)
            }
          } else {
            // do nothing
          }
        } catch (err) {
          return {
            success: false,
            message: 'failed when when updating timesheet. Reason : \n' + err.message,
          }
        }
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
        const SoM = moment(selectedDate).startOf('month').format('YYYY-MM-DD')
        let prevDate = null
        if (selectedDate.split('-')[2] === '01') {
          prevDate = moment(selectedDate).format('YYYY-MM-DD')
        } else {
          prevDate = moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD')
        }

        let equipmentPerformance = await EquipmentPerformance.query()
          .where(wh => {
            wh.where('equip_id', value.equip_id)
            wh.where('period_date_start', SoM)
            wh.where('period_date_end', prevDate)
          })
          .last()

        if (!equipmentPerformance) {
          equipmentPerformance = await EquipmentPerformance.query()
            .where(wh => {
              wh.where('equip_id', value.equip_id)
              wh.where('period_date_start', SoM)
            })
            .last()
        }

        const breakdown_hours_scheduled = (await GET_COUNT_SCHEDULED_BREAKDOWN('SCH', value.equip_id)) + equipmentPerformance.breakdown_hours_scheduled
        const breakdown_hours_unscheduled = (await GET_COUNT_SCHEDULED_BREAKDOWN('UNS', value.equip_id)) + equipmentPerformance.breakdown_hours_unscheduled
        const breakdown_hours_accident = (await GET_COUNT_SCHEDULED_BREAKDOWN('ACD', value.equip_id)) + equipmentPerformance.breakdown_hours_accident
        const breakdown_hours_total = breakdown_hours_scheduled + breakdown_hours_unscheduled + breakdown_hours_accident

        // console.log('sch >> ', breakdown_hours_scheduled)
        // console.log('uns >> ', breakdown_hours_unscheduled)
        // console.log('acd >> ', breakdown_hours_accident)
        // console.log('total >> ', breakdown_hours_total)

        const startDate = moment(equipmentPerformance.month).format('DD MMM')
        const nowDate = moment(selectedDate).format('DD MMM')

        equipmentPerformance.merge({
          budget_pa: GET_BUDGET_PA_EQUIPMENT(value.equip_id) || 0,
          period: `${startDate} - ${nowDate}`,
          period_date_start: SoM,
          period_date_end: selectedDate,
          breakdown_hours_scheduled: breakdown_hours_scheduled,
          breakdown_hours_unscheduled: breakdown_hours_unscheduled,
          breakdown_hours_accident: breakdown_hours_accident,
          breakdown_hours_total: breakdown_hours_total,
          standby_hours: equipmentPerformance.mohh - (equipmentPerformance.work_hours + breakdown_hours_total),
          actual_pa: ((equipmentPerformance.mohh - breakdown_hours_total) / equipmentPerformance.mohh) * 100,
          breakdown_ratio_scheduled: (breakdown_hours_scheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
          breakdown_ratio_unscheduled: (breakdown_hours_unscheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
        })

        try {
          await equipmentPerformance.save(trx)
          console.log(`---- success update data equipment performance : equip id ${value.equip_id} ----`)
        } catch (err) {
          await trx.rollback()
          return {
            success: false,
            message: 'failed when updating eq.perf to database. Reason : \n' + err.message,
          }
        }
      }
      await trx.commit(trx)
      return {
        success: true,
        message: 'Success upload daily downtime',
      }
    } catch (err) {
      await trx.rollback()
      return {
        success: false,
        message: 'failed upload daily downtime \n Reason : ' + err.message,
      }
    }
  }

  /**
   * @description HOUR METER UPLOAD
   */
  async uploadProcessHourMeter(req, filePath, user) {
    let trx = await db.beginTransaction()

    const sheet = req.sheet || 'DATABASE'

    const xlsx = excelToJson({
      sourceFile: filePath,
      header: 1,
    })

    const data = []
    const sheetData = xlsx[sheet].slice(2)
    const reqDate = moment(req.date).format('YYYY-MM-DD')

    // methods
    const GET_EQUIPMENT_DATA = async (tipe, model, name) => {
      let result = null
      if (name) {
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
          throw new Error(`Equipment Unit ${name} tidak di temukan pada master equipment...`)
        }
      }
    }

    const GET_STARTING_HOUR_METER_EQUIPMENT = async equipId => {
      if (equipId) {
        let getStartingHourMeterEquipment = await DailyChecklist.query(trx)
          .where(wh => {
            wh.where('tgl', moment(reqDate).startOf('month').format('YYYY-MM-DD'))
            wh.where('unit_id', equipId)
          })
          .last()
        if (!getStartingHourMeterEquipment) {
          getStartingHourMeterEquipment = await DailyChecklist.query(trx)
            .where(wh => {
              wh.where('unit_id', equipId)
            })
            .last()
        }
        return getStartingHourMeterEquipment || 0
      }
    }

    const GET_MTD_HOUR_METER_EQUIPMENT = async equipId => {
      if (equipId) {
        const start = moment(reqDate).startOf('month').format('YYYY-MM-DD')
        const end = moment(reqDate).endOf('month').format('YYYY-MM-DD')
        const equipment = await DailyChecklist.query()
          .where(wh => {
            wh.where('tgl', '>=', start)
            wh.where('tgl', '<=', end)
            wh.where('unit_id', equipId)
          })
          .last()
        return equipment
      }
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
            hm_total: value.O,
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

      try {
        // insert into equipment performance master
        // await EquipmentPerformanceHelpers.ADD(reqDate, user)

        const shifts = (await MasShift.query(trx).fetch()).toJSON()

        // now insert the data to daily timesheet
        for (const value of data) {
          // get equipment id
          const equipId = (await GET_EQUIPMENT_DATA(value.equipType, value.equipModel, value.equipName)).id
          /**
           * Define the daily timesheet object
           */
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
            // save the daily time sheet
            equipId && (await dailyChecklist.save(trx))
            console.log(`---- finished inserting timesheet id ${dailyChecklist.id} ----`)
          } catch (err) {
            // if
            await trx.rollback()
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
            const SoM = moment(reqDate).startOf('month').format('YYYY-MM-DD')
            let prevDate = null
            if (reqDate.split('-')[2] === '01') {
              prevDate = moment(reqDate).format('YYYY-MM-DD')
            } else {
              prevDate = moment(reqDate).subtract(1, 'day').format('YYYY-MM-DD')
            }

            let equipmentPerformance = await EquipmentPerformance.query(trx)
              .where(wh => {
                wh.where('equip_id', equipId)
                wh.where('period_date_start', SoM)
                wh.where('period_date_end', prevDate)
              })
              .last()

            if (!equipmentPerformance) {
              equipmentPerformance = await EquipmentPerformance.query(trx)
                .where(wh => {
                  wh.where('equip_id', equipId)
                  wh.where('period_date_start', SoM)
                })
                .last()
            }

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

              try {
                await equipmentPerformance.save(trx)
              } catch (err) {
                await trx.rollback()
                return {
                  success: false,
                  message: `Failed when updating hm equipment \n Reason : ` + err.message,
                }
              }
              console.log(`---- finished update hm equipment ${value.equipName} ----`)
            }

            /**
             * DAILY PERFORMANCE
             */
            const dailyEquipPerformance = await EquipmentPerformanceDetails.query(trx)
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

              await dailyEquipPerformance.save(trx)
              console.log(`---- finished update hm equipment ${value.equipName} for daily ----`)
            }
          } catch (err) {
            await trx.rollback()
            console.log('error update eq.performance ?', err.message)
            return {
              success: false,
              message: 'Failed when updating timesheet to eq.performance .\n Reason : ' + err.message,
              reason: err.message,
            }
          }
        }

        // commit the transaction hour meter upload
        await trx.commit(trx)
        return {
          success: true,
          message: 'Finished upload hour meter.',
        }
      } catch (err) {
        await trx.rollback()
        return {
          success: true,
          message: 'Failed to upload hour meter. \n Reason : ' + err.message,
        }
      }
    }
  }

  async timesheetChecks(equipId, date, siteId) {
    const trx = await db.beginTransaction()
    const GET_STARTING_HOUR_METER_EQUIPMENT = async equipId => {
      if (equipId) {
        let getStartingHourMeterEquipment = await DailyChecklist.query(trx)
          .where(wh => {
            wh.where('tgl', moment(date).startOf('month').format('YYYY-MM-DD'))
            wh.where('unit_id', equipId)
          })
          .last()
        if (!getStartingHourMeterEquipment) {
          getStartingHourMeterEquipment = await DailyChecklist.query(trx)
            .where(wh => {
              wh.where('unit_id', equipId)
            })
            .last()
        }
        return getStartingHourMeterEquipment || 0
      }
    }

    const GET_MTD_HOUR_METER_EQUIPMENT = async equipId => {
      if (equipId) {
        const start = moment(date).startOf('month').format('YYYY-MM-DD')
        const end = moment(date).endOf('month').format('YYYY-MM-DD')
        const equipment = await DailyChecklist.query()
          .where(wh => {
            wh.where('tgl', '>=', start)
            wh.where('tgl', '<=', end)
            wh.where('unit_id', equipId)
          })
          .last()
        return equipment
      }
    }

    //
    const SMU_BEGIN = (await GET_STARTING_HOUR_METER_EQUIPMENT(equipId)).begin_smu
    const SMU_MTD = (await GET_MTD_HOUR_METER_EQUIPMENT(equipId))?.end_smu
    const USED_SMU = SMU_MTD - SMU_BEGIN || 0

    /**
     * MONTHLY PERFORMANCE
     */
    // update equipment performance master
    const SoM = moment(date).startOf('month').format('YYYY-MM-DD')
    let prevDate = null
    if (date.split('-')[2] === '01') {
      prevDate = moment(date).format('YYYY-MM-DD')
    } else {
      prevDate = moment(date).subtract(1, 'day').format('YYYY-MM-DD')
    }

    let equipmentPerformance = await EquipmentPerformance.query(trx)
      .where(wh => {
        wh.where('equip_id', equipId)
        wh.where('period_date_start', SoM)
        wh.where('period_date_end', prevDate)
      })
      .last()

    if (!equipmentPerformance) {
      equipmentPerformance = await EquipmentPerformance.query(trx)
        .where(wh => {
          wh.where('equip_id', equipId)
          wh.where('period_date_start', SoM)
        })
        .last()
    }

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

      try {
        await equipmentPerformance.save(trx)
      } catch (err) {
        await trx.rollback()
        return {
          success: false,
          message: `Failed when updating hm equipment \n Reason : ` + err.message,
        }
      }
      // console.log(`---- finished update hm equipment ----`)
    }

    /**
     * DAILY PERFORMANCE
     */
    const dailyEquipPerformance = await EquipmentPerformanceDetails.query(trx)
      .where(wh => {
        wh.where('date', date)
        wh.where('equip_id', equipId)
        wh.where('site_id', siteId)
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
      await dailyEquipPerformance.save(trx)
      // console.log(`---- finished update hm equipment for daily ----`)
    }

    await trx.commit(trx)
  }

  async dailyEquipmentPerformanceChecks(equipId, date) {}

  async budgetPAChecks(equipId, date, siteId, budgetPA) {
    const trx = await db.beginTransaction()
    // update monthly equipment performance budget pa
    const SoM = moment(date).startOf('month').format('YYYY-MM-DD')
    let prevDate = null
    if (date.split('-')[2] === '01') {
      prevDate = moment(date).format('YYYY-MM-DD')
    } else {
      prevDate = moment(date).subtract(1, 'day').format('YYYY-MM-DD')
    }

    // update daily equipment performance budget pa
    let equipmentPerformance = await EquipmentPerformance.query(trx)
      .where(wh => {
        wh.where('equip_id', equipId)
        wh.where('period_date_start', SoM)
        wh.where('period_date_end', prevDate)
      })
      .last()

    if (!equipmentPerformance) {
      equipmentPerformance = await EquipmentPerformance.query(trx)
        .where(wh => {
          wh.where('equip_id', equipId)
          wh.where('period_date_start', SoM)
        })
        .last()
    }

    if (equipmentPerformance) {
      equipmentPerformance.merge({
        budget_pa: budgetPA,
      })
      await equipmentPerformance.save(trx)
    }

    const dailyEquipPerformance = await EquipmentPerformanceDetails.query(trx)
      .where(wh => {
        wh.where('date', date)
        wh.where('equip_id', equipId)
        wh.where('site_id', siteId)
      })
      .last()

    if (dailyEquipPerformance) {
      dailyEquipPerformance.merge({
        budget_pa: budgetPA,
      })
      await dailyEquipPerformance.save(trx)
    }

    try {
      await trx.commit(trx)
    } catch (err) {
      return {
        success: false,
        message: 'failed when updating equipment budget pa, unit id ' + equipId,
      }
    }
  }
}

module.exports = new DailyDowntime()

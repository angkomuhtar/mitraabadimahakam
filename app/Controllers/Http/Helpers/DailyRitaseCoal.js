'use strict'

const DailyRitaseCoal = use('App/Models/DailyRitaseCoal')
const DailyRitaseCoalDetail = use('App/Models/DailyRitaseCoalDetail')
const excelToJson = require('convert-excel-to-json')
const fs = require('fs')
const _ = require('underscore')
const moment = require('moment')
const MasShift = use('App/Models/MasShift')
const MasPit = use('App/Models/MasPit')
const MasFleet = use('App/Models/MasFleet')
const MasEquipment = use('App/Models/MasEquipment')
const MasEquipmentSubcon = use('App/Models/MasEquipmentSubcont')
const MasSeam = use('App/Models/MasSeam')
const DailyFleet = use('App/Models/DailyFleet')
const DailyFleetEquipment = use('App/Models/DailyFleetEquip')
const Helpers = use('Helpers')
const diagnoticTime = use('App/Controllers/Http/customClass/diagnoticTime')

class RitaseCoal {
  async ALL(req) {
    const limit = 25
    const halaman = req.page === undefined ? 1 : parseInt(req.page)
    let dailyRitase
    if (req.keyword) {
      dailyRitase = await DailyRitaseCoal.query()
        .with('checker')
        .with('shift')
        .with('daily_fleet', details => {
          details.with('details', unit => unit.with('equipment'))
          details.with('activities')
          details.with('fleet')
          details.with('pit')
        })
        .andWhere('status', 'Y')
        .orderBy('created_at', 'desc')
        .paginate(halaman, limit)
    } else {
      dailyRitase = await DailyRitaseCoal.query()
        .with('checker')
        .with('shift')
        .with('daily_fleet', details => {
          details.with('details', unit => unit.with('equipment'))
          details.with('activities')
          details.with('fleet')
          details.with('pit')
        })
        .where('status', 'Y')
        .orderBy('created_at', 'desc')
        .paginate(halaman, limit)
    }

    return dailyRitase
  }

  async GET_ID(params) {
    const dailyRitase = await DailyRitaseCoal.query()
      .with('checker')
      .with('shift')
      .with('daily_fleet', details => {
        details.with('details', unit => unit.with('equipment'))
        details.with('activities')
        details.with('fleet')
        details.with('pit')
      })
      .andWhere({ status: 'Y', id: params.id })
      .first()
    return dailyRitase
  }

  async POST(req) {
    try {
      const ritaseCoal = new DailyRitaseCoal()
      ritaseCoal.fill(req)
      await ritaseCoal.save()
      return ritaseCoal
    } catch (error) {
      return error
    }
  }

  async UPDATE(params, req) {
    try {
      const ritaseCoal = await DailyRitaseCoal.find(params.id)
      ritaseCoal.merge(req)
      await ritaseCoal.save()
      return ritaseCoal
    } catch (error) {
      return error
    }
  }

  async DELETE(params) {
    try {
      const ritaseCoal = await DailyRitaseCoal.find(params.id)
      await ritaseCoal.delete()
      return ritaseCoal
    } catch (error) {
      return error
    }
  }

  async GET_MONTH_EXCEL_DATA_PRODUCTION(filePath, req, usr) {
    const sampleSheet = req.sheet || 'COAL'

    const xlsx = excelToJson({
      sourceFile: filePath,
      header: 1,
    })

    var t0 = performance.now()
    let durasi

    const data = []
    const monthLength = moment(req.date).daysInMonth()
    const endIndex = xlsx[sampleSheet].findIndex(v => v.F === '')
    const sheetData = xlsx[sampleSheet].slice(2)
    const daysArr = Array.from({ length: monthLength }).map((v, i) => {
      return moment(req.date).startOf('month').add(i, 'day').format('YYYY-MM-DD')
    })

    let sheetIndexs = 0
    let sheetIndexLog = ''
    let originalData = []
    let originalDataIDs = []
    let _totalRitase = 0
    let toCompareArr = []
    let toCompareIDs = []

    for (const value of sheetData) {
      sheetIndexs += 1

      if (value.F && value.O && (value.L === 'PIT RPU' || value.L === 'PIT KARIMATA' || value.L === 'PIT DERAWAN')) {
        const obj = {
          calendarDate: moment(value.F).add(1, 'days').format('YYYY-MM-DD'),
          workDate: moment(value.E).format('YYYY-MM-DD'),
          shift: value.D,
          pitName: value.L,
          seam: value.K,
          subcon_hauler: value.J,
          check_in: typeof value.G === 'string' ? `${value.G}:00` : moment(value.G).format('HH:mm:ss'),
          check_out: typeof value.H === 'string' ? `${value.H}:00` : moment(value.H).format('HH:mm:ss'),
          no_tiket: value.I,
          gross: parseFloat(value.M) || 0,
          tarre: parseFloat(value.N) || 0,
          netto: parseFloat(value.O) || 0,
          divider: moment(value.F).format('YYYY-MM-DD') + ' ' + value.D + ' ' + value.K + ' ' + value.L,
          totalRitase: value.Q || 1,
          sheetIndex: sheetIndexs,
        }

        originalData.push(obj)
        sheetIndexLog += `${sheetIndexs} \n \n`
        originalDataIDs.push(sheetIndexs)
        data.push(obj)
      }
    }

    const daysData = []
    for (const day of daysArr) {
      const obj = {
        date: day,
        data: data.filter(v => v.calendarDate === day),
      }
      daysData.push(obj)
    }

    const dividerData = []

    for (const value of daysData) {
      for (const data of value.data) {
        dividerData.push({
          date: value.date,
          seam: data.seam,
          shift: data.shift,
          pitName: data.pitName,
          divider: data.divider,
        })
      }
    }

    const shifts = (await MasShift.query().fetch()).toJSON().map(v => v.kode)

    const GET_DATA_BY_SHIFT_AND_DATE = (shift, date) => {
      let result = []
      for (const data of dividerData) {
        if (data.shift === shift && data.date === date) result.push(data)
      }

      return result
    }

    const shiftData = []
    for (const day of daysArr) {
      for (const shift of shifts) {
        const obj = {
          date: day,
          shiftName: shift,
          data: GET_DATA_BY_SHIFT_AND_DATE(shift, day),
        }
        shiftData.push(obj)
      }
    }

    const GET_DATA_BY_DIVIDER_NAME_DATE_AND_SHIFT = (divider, date, shift) => {
      let result = {}

      for (const data of dividerData) {
        if (data.divider === divider && data.date === date && data.shift === shift) {
          result = data
        }
      }
      return result
    }

    const _temp = []
    for (const data of shiftData) {
      const obj = {
        date: data.date,
        shift: data.shiftName,
        pitData: _.uniq(data.data.map(v => v.divider)),
      }

      _temp.push(obj)
    }

    const __temp = []
    for (const data of _temp) {
      let obj = {
        date: data.date,
        shift: data.shift,
      }

      let pitData = []
      for (const exca of data.pitData) {
        pitData.push(GET_DATA_BY_DIVIDER_NAME_DATE_AND_SHIFT(exca, data.date, data.shift))
      }
      obj = {
        ...obj,
        pitData,
      }

      __temp.push(obj)
    }

    const GET_DATA = divider => {
      let result = []

      for (const value of data) {
        if (value.divider === divider) {
          result.push(value)
        }
      }
      return result
    }

    // SUBCON EQUIPMENT FROM PARSING DATA
    const subconEquipments = []

    const _temp_ = []
    for (const value of __temp) {
      let haulers = []
      for (const data of value.pitData) {
        haulers.push({
          ...data,
          haulers: GET_DATA(data.divider),
        })
        subconEquipments.push(GET_DATA(data.divider))
      }

      const obj = {
        ...value,
        pitData: haulers,
      }

      _temp_.push(obj)
    }

    // FINAL DATA AFTER PARSING FROM EXCEL
    const finalData = _temp_.filter(v => v.pitData && v.pitData.length > 0)

    const GET_SHIFT_DATA = async kode => {
      let startShift = null

      const shifts = (await MasShift.query().fetch()).toJSON()

      for (const shift of shifts) {
        if (shift.kode === kode) {
          startShift = shift.start_shift
        }
      }

      return startShift
    }

    // CHECK IF ALL UNIT AND SEAM IS EXISTING TO THE DATABASE
    for (const eq of subconEquipments) {
      for (const equipments of eq) {
        // UNIT / EQUIPMENT CHECK
        const equipmentCode = equipments.subcon_hauler
        const masSubConEquipment = await MasEquipmentSubcon.query().where('kode', equipmentCode).first()

        if (masSubConEquipment) {
          // do nothing
        } else {
          // if subcon equipment is unknown to database, then we create a new one
          let newSubConEquipment = new MasEquipmentSubcon()
          newSubConEquipment.fill({
            subcont_id: 10, // temporary
            kode: equipmentCode,
            brand: 'hino',
            tipe: 'HAULER',
            aktif: 'Y',
          })
          await newSubConEquipment.save()
        }

        // PIT CHECK
        let pitName = equipments.pitName.split(' ')[1]

        if (pitName === 'DERAWAN') {
          pitName = 'DERAWAN BARU'
        }

        if (pitName === 'PNG') {
          pitName = 'PINANG'
        }

        const masPit = await MasPit.query().where('name', pitName).first()
        // SEAM CHECK
        const seamName = equipments.seam

        const masSeam = await MasSeam.query().where('kode', seamName).andWhere('pit_id', masPit?.id).first()

        if (masSeam) {
          // do nothing
        } else {
          // if the seam is unknown to database, then we create a new one
          let newSeam = new MasSeam()

          newSeam.fill({
            pit_id: masPit?.toJSON()?.id,
            kode: equipments.seam,
          })

          try {
            await newSeam.save()
          } catch (err) {
            return {
              success: false,
              message: `Insert into MasSeam failed \n Reason : ${err.message}`,
            }
          }
        }
      }
    }
    // END OF CHECKING EQUIPMENT AND SEAM DATA

    /**
     * Top Level Variable
     */
    let totalTonnMetric = []

    /**
     * Begin Process
     */
    for (const value of finalData) {
      for (const data of value.pitData) {
        let PIT_NAME = data.pitName.split(' ')[1]

        if (PIT_NAME === 'DERAWAN') {
          PIT_NAME = 'DERAWAN BARU'
        }

        if (PIT_NAME === 'PNG') {
          PIT_NAME = 'PINANG'
        }

        const GET_PIT_ID = (await MasPit.query().where('name', PIT_NAME).first())?.id
        const GET_SHIFT_ID = (await MasShift.query().where('kode', data.shift).first())?.id

        /**
         * Add a new Daily Fleet
         */
        const dailyFleet = new DailyFleet()
        dailyFleet.fill({
          fleet_id: PIT_NAME === 'RPU' ? 26 : PIT_NAME === 'DERAWAN BARU' ? 24 : 25,
          pit_id: GET_PIT_ID,
          shift_id: GET_SHIFT_ID,
          activity_id: 8, // coal getting
          user_id: usr.id,
          date: data.date,
        })

        try {
          await dailyFleet.save()
        } catch (err) {
          return {
            success: false,
            message: `Insert into daily fleet failed \n Reason : ${err.message}`,
          }
        }

        /**
         * Add new Daily Fleet Equipment
         */
        // const dailyFleetEquip = new DailyFleetEquipment()
        // dailyFleetEquip.fill({
        //   dailyfleet_id: dailyFleet.id,
        //   equip_id: GET_EXCA_ID,
        //   datetime: `${data.date} ${await GET_SHIFT_DATA(data.shift)}`,
        // })
        // try {
        //   await dailyFleetEquip.save()
        // } catch (err) {
        //   return {
        //     success: false,
        //     message: 'Insert into daily fleet equipment failed \n Reason : ' + err.message,
        //   }
        // }

        /**
         * Checks for Existing Daily Ritase Coal
         */
        const date = moment(`${data.date} ${await GET_SHIFT_DATA(data.shift)}`).format('YYYY-MM-DD HH:mm:ss')
        const dailyRitaseCheck = await DailyRitaseCoal.query()
          .where(wh => {
            wh.where('pit_id', GET_PIT_ID)
            wh.andWhere('shift_id', GET_SHIFT_ID)
            wh.andWhere('distance', PIT_NAME === 'RPU' ? 23.3 : PIT_NAME === 'DERAWAN BARU' ? 23.4 : PIT_NAME === 'KARIMATA' ? 22.9 : 21)
            wh.andWhere('date', date)
            wh.andWhere('coal_rit', data.haulers.length)
            wh.andWhere(
              'tw_gross',
              data.haulers.reduce((a, b) => a + b.gross, 0)
            )
            wh.andWhere(
              'tw_tare',
              data.haulers.reduce((a, b) => a + b.tarre, 0)
            )
            wh.andWhere(
              'tw_netto',
              data.haulers.reduce((a, b) => a + b.netto, 0)
            )
          })
          .first()

        /**
         * If Daily Ritase Coal Found, then use the existing one
         */
        let dailyRitase = null
        if (dailyRitaseCheck) {
          dailyRitase = dailyRitaseCheck

          console.log('using existing daily ritase id >> ', dailyRitaseCheck.id)

          console.log(' --- starting deleting all ritase coal detail for id ' + dailyRitaseCheck.id + ' ---')

          await DailyRitaseCoalDetail.query().where('ritasecoal_id', dailyRitaseCheck.id).delete()

          console.log(' --- finished deleting all ritase coal detail for id ' + dailyRitaseCheck.id + ' ---')
        } else {
          /**
           * If Daily Ritase Coal not found, then we create a new one
           */
          const dR = new DailyRitaseCoal()
          dR.fill({
            dailyfleet_id: dailyFleet.id,
            exca_id: null,
            checker_id: usr.id,
            shift_id: GET_SHIFT_ID,
            distance: PIT_NAME === 'RPU' ? 23.3 : PIT_NAME === 'DERAWAN BARU' ? 23.4 : PIT_NAME === 'KARIMATA' ? 22.9 : 21, // 21 is PIT PINANG
            date: date,
            block: 0,
          })

          await dR.save()
          dailyRitase = dR.toJSON()
        }

        // HAULERS
        let indexs = 0
        for (const hauler of data.haulers) {
          indexs += 1

          const HAULER_NAME = hauler.subcon_hauler

          let GET_HAULER_ID = await MasEquipmentSubcon.query().where('kode', HAULER_NAME).first()
          let GET_SEAM_ID = await MasSeam.query().where('kode', hauler.seam).andWhere('pit_id', GET_PIT_ID).last()

          /**
           * #TODO / Future Update
           * We're not adding subcontractor equipment into our Daily Fleet Equipment
           */
          // const dailyFleetEquip = new DailyFleetEquipment()

          // dailyFleetEquip.fill({
          //   dailyfleet_id: dailyFleet.id,
          //   equip_id: GET_HAULER_ID?.id,
          //   datetime: `${data.date} ${await GET_SHIFT_DATA(data.shift)}`,
          // })

          // await dailyFleetEquip.save()

          let countRitase = 0
          /**
           * Array to Compare
           */
          toCompareArr.push({
            sheetIndex: hauler.sheetIndex,
            date: data.date,
            shift: data.shift,
            ritasecoal_id: dailyRitase.id,
            seam_id: GET_SEAM_ID?.toJSON()?.id,
            dt_id: null,
            subcondt_id: GET_HAULER_ID?.toJSON()?.id,
            operator: null,
            subcon_operator: null,
            checkout_pit:
              hauler.check_out ||
              moment(`${data.date} ${await GET_SHIFT_DATA(data.shift)}`)
                .subtract(3, 'hour')
                .format('YYYY-MM-DD HH:mm:ss'),
            checkin_jt: hauler.check_in || `${data.date} ${await GET_SHIFT_DATA(data.shift)}`,
            checkout_jt:
              hauler.check_out ||
              moment(`${data.date} ${await GET_SHIFT_DATA(data.shift)}`)
                .add(3, 'hour')
                .format('YYYY-MM-DD HH:mm:ss'),
            ticket: hauler.no_tiket,
            kupon: hauler.no_tiket,
            w_gross: hauler.gross,
            w_tare: hauler.tarre,
            w_netto: hauler.netto,
            keterangan: 'back date upload',
            checker_jt: usr.id,
            stockpile: null,
            coal_tipe: null,
          })

          /**
           * Array of sheet index to compare
           */
          toCompareIDs.push(hauler.sheetIndex)

          /**
           * Loop based on number of Hauler's rotation
           */
          for (let totalRitase = 1; totalRitase <= parseInt(hauler.totalRitase); totalRitase++) {
            // num of current hauler's rotation
            countRitase += 1
            // accumulate of all hauler's rotation
            _totalRitase += 1

            const dailyritaseCoalDetail = new DailyRitaseCoalDetail()
            dailyritaseCoalDetail.fill({
              ritasecoal_id: dailyRitase.id,
              seam_id: GET_SEAM_ID?.toJSON()?.id,
              dt_id: null,
              subcondt_id: GET_HAULER_ID?.toJSON()?.id,
              operator: null,
              subcon_operator: null,
              checkout_pit: hauler.check_out
                ? `${data.date} ${hauler.check_out}`
                : moment(`${data.date} ${await GET_SHIFT_DATA(data.shift)}`)
                    .subtract(3, 'hour')
                    .format('YYYY-MM-DD HH:mm:ss'),
              checkin_jt: hauler.check_in ? `${data.date} ${hauler.check_in}` : `${data.date} ${await GET_SHIFT_DATA(data.shift)}`,
              checkout_jt: hauler.check_out
                ? `${data.date} ${hauler.check_out}`
                : moment(`${data.date} ${await GET_SHIFT_DATA(data.shift)}`)
                    .add(3, 'hour')
                    .format('YYYY-MM-DD HH:mm:ss'),
              ticket: hauler.no_tiket,
              kupon: hauler.no_tiket,
              w_gross: hauler.gross,
              w_tare: hauler.tarre,
              w_netto: hauler.netto,
              keterangan: 'back date upload',
              checker_jt: usr.id,
              stockpile: null,
              coal_tipe: null,
            })

            try {
              await dailyritaseCoalDetail.save()
            } catch (err) {
              return {
                success: false,
                message: `Failed insert into Daily Ritase Coal Detail \n Reason : ${err.message}`,
              }
            }
          }

          // total metric tonnes
          totalTonnMetric.push(hauler.netto)

          console.log(
            `---- finished creating data index : ${hauler.sheetIndex} daily fleet id : ${dailyFleet.id} ${data.date} - ${hauler.no_tiket} - ${data.shift} - ${HAULER_NAME} - ${PIT_NAME} - ${GET_SEAM_ID?.kode} - ${countRitase} RIT  ${hauler.netto} MT ---- `
          )
        }
      }
    }

    // CHECK IF ALL DATA INSERTED CORRECTLY
    try {
      /**
       * Length of Original Array and Inserted into database
       */
      const originalDataLength = originalData.length
      const insertedDataLength = toCompareArr.length

      const GET_DATA_BY_ID = id => {
        let result = null
        for (const value of originalData) {
          if (value.sheetIndex === id) {
            result = value
          }
        }
        return result
      }

      if (insertedDataLength !== originalDataLength) {
        // check the index difference
        const difference = _.difference(originalDataIDs, toCompareIDs)

        console.log('------ STARTING INSERT EXCLUDED DATA TO DATABASE ------ ')

        // get the missing data from the original sheet data
        const data = []
        for (const index of difference) {
          data.push(GET_DATA_BY_ID(index))
        }

        const daysData = []
        for (const day of daysArr) {
          const obj = {
            date: day,
            data: data.filter(v => v.calendarDate === day),
          }
          daysData.push(obj)
        }

        const dividerData = []

        for (const value of daysData) {
          for (const data of value.data) {
            dividerData.push({
              date: value.date,
              seam: data.seam,
              shift: data.shift,
              pitName: data.pitName,
              divider: data.divider,
            })
          }
        }

        const shifts = (await MasShift.query().fetch()).toJSON().map(v => v.kode)

        const GET_DATA_BY_SHIFT_AND_DATE = (shift, date) => {
          let result = []
          for (const data of dividerData) {
            if (data.shift === shift && data.date === date) result.push(data)
          }

          return result
        }

        const shiftData = []
        for (const day of daysArr) {
          for (const shift of shifts) {
            const obj = {
              date: day,
              shiftName: shift,
              data: GET_DATA_BY_SHIFT_AND_DATE(shift, day),
            }
            shiftData.push(obj)
          }
        }

        const GET_DATA_BY_DIVIDER_NAME_DATE_AND_SHIFT = (divider, date, shift) => {
          let result = {}

          for (const data of dividerData) {
            if (data.divider === divider && data.date === date && data.shift === shift) {
              result = data
            }
          }
          return result
        }

        const _temp = []
        for (const data of shiftData) {
          const obj = {
            date: data.date,
            shift: data.shiftName,
            pitData: _.uniq(data.data.map(v => v.divider)),
          }
          _temp.push(obj)
        }

        const __temp = []
        for (const data of _temp) {
          let obj = {
            date: data.date,
            shift: data.shift,
          }

          let pitData = []
          for (const exca of data.pitData) {
            pitData.push(GET_DATA_BY_DIVIDER_NAME_DATE_AND_SHIFT(exca, data.date, data.shift))
          }
          obj = {
            ...obj,
            pitData,
          }

          __temp.push(obj)
        }

        const GET_DATA = divider => {
          let result = []

          for (const value of data) {
            if (value.divider === divider) {
              result.push(value)
            }
          }
          return result
        }

        // SUBCON EQUIPMENT FROM PARSING DATA
        const subconEquipments = []

        const _temp_ = []
        for (const value of __temp) {
          let haulers = []
          for (const data of value.pitData) {
            haulers.push({
              ...data,
              haulers: GET_DATA(data.divider),
            })
            subconEquipments.push(GET_DATA(data.divider))
          }

          const obj = {
            ...value,
            pitData: haulers,
          }

          _temp_.push(obj)
        }

        // FINAL DATA AFTER PARSING FROM EXCEL
        const finalData = _temp_.filter(v => v.pitData && v.pitData.length > 0)

        const GET_SHIFT_DATA = async kode => {
          let startShift = null

          const shifts = (await MasShift.query().fetch()).toJSON()

          for (const shift of shifts) {
            if (shift.kode === kode) {
              startShift = shift.start_shift
            }
          }

          return startShift
        }

        // CHECK IF ALL UNIT AND SEAM IS EXISTING TO THE DATABASE
        for (const eq of subconEquipments) {
          for (const equipments of eq) {
            // UNIT / EQUIPMENT CHECK
            const equipmentCode = equipments.subcon_hauler
            const masSubConEquipment = await MasEquipmentSubcon.query().where('kode', equipmentCode).first()

            if (masSubConEquipment) {
              // do nothing
            } else {
              // if subcon equipment is unknown to database, then we create a new one
              let newSubConEquipment = new MasEquipmentSubcon()
              newSubConEquipment.fill({
                subcont_id: 10, // temporary
                kode: equipmentCode,
                brand: 'hino',
                tipe: 'HAULER',
                aktif: 'Y',
              })
              await newSubConEquipment.save()
            }

            // PIT CHECK
            let pitName = equipments.pitName.split(' ')[1]

            if (pitName === 'DERAWAN') {
              pitName = 'DERAWAN BARU'
            }

            if (pitName === 'PNG') {
              pitName = 'PINANG'
            }

            const masPit = await MasPit.query().where('name', pitName).first()
            // SEAM CHECK
            const seamName = equipments.seam

            const masSeam = await MasSeam.query().where('kode', seamName).andWhere('pit_id', masPit?.id).first()
            if (masSeam) {
              // do nothing
            } else {
              // if the seam is unknown to database, then we create a new one
              let newSeam = new MasSeam()

              newSeam.fill({
                pit_id: masPit?.toJSON()?.id,
                kode: equipments.seam,
              })

              await newSeam.save()
            }
          }
        }
        // END OF CHECKING EQUIPMENT AND SEAM DATA

        // TOP LEVEL VARIABLE
        let totalTonnMetric = []

        // PROCESS THE FINAL DATA
        for (const value of finalData) {
          for (const data of value.pitData) {
            // CREATE NEW DAILY FLEET
            const dailyFleet = new DailyFleet()

            // PIT NAME
            let PIT_NAME = data.pitName.split(' ')[1]

            if (PIT_NAME === 'DERAWAN') {
              PIT_NAME = 'DERAWAN BARU'
            }

            if (PIT_NAME === 'PNG') {
              PIT_NAME = 'PINANG'
            }

            const GET_PIT_ID = (await MasPit.query().where('name', PIT_NAME).first())?.id
            const GET_SHIFT_ID = (await MasShift.query().where('kode', data.shift).first())?.id

            // DEFINE THE DAILY FLEET DATA
            dailyFleet.fill({
              fleet_id: PIT_NAME === 'RPU' ? 26 : PIT_NAME === 'DERAWAN BARU' ? 24 : 25,
              pit_id: GET_PIT_ID,
              shift_id: GET_SHIFT_ID,
              activity_id: 8, // coal getting
              user_id: usr.id,
              date: data.date,
            })

            // save the daily fleet for coal
            await dailyFleet.save()

            // also create the daily fleet equipment for this fleet
            // const dailyFleetEquip = new DailyFleetEquipment()

            // dailyFleetEquip.fill({
            //   dailyfleet_id: dailyFleet.id,
            //   equip_id: GET_EXCA_ID,
            //   datetime: `${data.date} ${await GET_SHIFT_DATA(data.shift)}`,
            // })
            // await dailyFleetEquip.save()

            const date = moment(`${data.date} ${await GET_SHIFT_DATA(data.shift)}`).format('YYYY-MM-DD HH:mm:ss')
            // CHECK EXISTING DAILY RITASE COAL
            const dailyRitaseCheck = await DailyRitaseCoal.query()
              .where(wh => {
                wh.where('pit_id', GET_PIT_ID)
                wh.andWhere('shift_id', GET_SHIFT_ID)
                wh.andWhere('distance', PIT_NAME === 'RPU' ? 23.3 : PIT_NAME === 'DERAWAN BARU' ? 23.4 : PIT_NAME === 'KARIMATA' ? 22.9 : 21)
                wh.andWhere('date', date)
              })
              .first()

            let dailyRitase = null
            if (dailyRitaseCheck) {
              dailyRitase = dailyRitaseCheck

              console.log('using existing daily ritase id >> ', dailyRitaseCheck.id)

              console.log(' --- starting deleting all ritase coal detail for id ' + dailyRitaseCheck.id + ' ---')

              await DailyRitaseCoalDetail.query().where('ritasecoal_id', dailyRitaseCheck.id).delete()

              console.log(' --- finished deleting all ritase coal detail for id ' + dailyRitaseCheck.id + ' ---')
            } else {
              // IF NOT EXISTING DAILY RITASE COAL THEN WE CREATE A NEW ONE
              const dR = new DailyRitaseCoal()
              dR.fill({
                dailyfleet_id: dailyFleet.id,
                exca_id: null,
                checker_id: usr.id,
                shift_id: GET_SHIFT_ID,
                distance: PIT_NAME === 'RPU' ? 23.3 : PIT_NAME === 'DERAWAN BARU' ? 23.4 : PIT_NAME === 'KARIMATA' ? 22.9 : 21, // 21 is PIT PINANG
                date: date,
                block: 0,
              })

              await dR.save()

              dailyRitase = dR.toJSON()

              console.log('creating new daily ritase coal id >> ', dR.id)
            }

            // HAULERS
            let indexs = 0
            for (const hauler of data.haulers) {
              indexs += 1

              const HAULER_NAME = hauler.subcon_hauler

              let GET_HAULER_ID = await MasEquipmentSubcon.query().where('kode', HAULER_NAME).first()
              let GET_SEAM_ID = await MasSeam.query().where('kode', hauler.seam).andWhere('pit_id', GET_PIT_ID).last()

              // CUZ WE DONT ADD SUBCON TO DAILY FLEET EQUIPMENT
              //   const dailyFleetEquip = new DailyFleetEquipment()

              //   dailyFleetEquip.fill({
              //     dailyfleet_id: dailyFleet.id,
              //     equip_id: GET_HAULER_ID?.id,
              //     datetime: `${data.date} ${await GET_SHIFT_DATA(data.shift)}`,
              //   })

              //   await dailyFleetEquip.save()

              let countRitase = 0

              for (let totalRitase = 1; totalRitase <= parseInt(hauler.totalRitase); totalRitase++) {
                countRitase += 1
                _totalRitase += 1

                const dailyritaseCoalDetail = new DailyRitaseCoalDetail()

                dailyritaseCoalDetail.fill({
                  ritasecoal_id: dailyRitase.id,
                  seam_id: GET_SEAM_ID?.toJSON()?.id,
                  dt_id: null,
                  subcondt_id: GET_HAULER_ID?.toJSON()?.id,
                  operator: null,
                  subcon_operator: null,
                  checkout_pit:
                    hauler.check_out ||
                    moment(`${data.date} ${await GET_SHIFT_DATA(data.shift)}`)
                      .subtract(3, 'hour')
                      .format('YYYY-MM-DD HH:mm:ss'),
                  checkin_jt: hauler.check_in || `${data.date} ${await GET_SHIFT_DATA(data.shift)}`,
                  checkout_jt:
                    hauler.check_out ||
                    moment(`${data.date} ${await GET_SHIFT_DATA(data.shift)}`)
                      .add(3, 'hour')
                      .format('YYYY-MM-DD HH:mm:ss'),
                  ticket: hauler.no_tiket,
                  kupon: hauler.no_tiket,
                  w_gross: hauler.gross,
                  w_tare: hauler.tarre,
                  w_netto: hauler.netto,
                  keterangan: 'back date upload',
                  checker_jt: usr.id,
                  stockpile: null,
                  coal_tipe: null,
                })

                await dailyritaseCoalDetail.save()
              }

              totalTonnMetric.push(hauler.netto)

              console.log(
                `---- finished creating missing data index : ${hauler.sheetIndex} ${data.date} - ${hauler.no_tiket} - ${data.shift} - ${HAULER_NAME} - ${PIT_NAME} - ${GET_SEAM_ID?.kode} - ${countRitase} RIT  ${hauler.netto} MT ---- `
              )
            }
          }
        }
      }
    } catch (err) {
      console.log('error >> ', err.message)
    }
    console.log('total ritase >> ', _totalRitase)
    console.log('---- SCRIPT FINISHED WITH ACCUMULATE ' + totalTonnMetric.reduce((a, b) => a + b, 0) + ' MT ----')
    return {
      data: [1, 2, 3],
      dr: 0,
    }
  }
}

module.exports = new RitaseCoal()

'use strict'
const db = use('Database')
const FuelSummary = use('App/Models/MamFuelRatio')
const excelToJson = require('convert-excel-to-json')
const Helpers = use('Helpers')
const moment = require('moment')
const MasPit = use('App/Models/MasPit')

class FuelSummaryHelpers {
  async LIST(req) {
    const limit = req.limit || 25
    const halaman = req.page === undefined ? 1 : parseInt(req.page)
    const fuelSummary = await FuelSummary.query()
      .with('site')
      .with('pit', wh => wh.with('site'))
      .where(w => {
        if (req.site_id) {
          w.where('site_id', req.site_id)
        }
        if (req.pit_id) {
          w.where('pit_id', req.pit_id)
        }
        if (req.start_date && req.end_date) {
          w.where('date', '>=', req.start_date)
          w.where('date', '<=', req.end_date)
        }
      })
      .orderBy([{ column: 'date', order: 'desc' }])
      .paginate(halaman, limit)

    return fuelSummary.toJSON()
  }

  async uploadDailyFuelSummary(req, usr) {
    const { date, current_file_name, fuel_usage_upload_type } = req

    var pathData = Helpers.publicPath(`/upload/`)
    const filePath = `${pathData}${JSON.parse(current_file_name)}`
    const fileName = JSON.parse(current_file_name).toLowerCase()

    let pitName = null

    if (fileName.includes('karimata')) {
      console.log('krm')
      pitName = 'KARIMATA'
    }

    if (fileName.includes('derawan')) {
      console.log('drw')
      pitName = 'DERAWAN'
    }

    if (fileName.includes('rpu')) {
      console.log('rpu')
      pitName = 'RPU'
    }

    const xlsx = excelToJson({
      sourceFile: filePath,
      header: 1,
    })

    var t0 = performance.now()
    let durasi

    const monthLength = moment(date).daysInMonth()
    const daysArr = Array.from({ length: monthLength }).map((v, i) => {
      return moment(date).startOf('month').add(i, 'day').format('YYYY-MM-DD')
    })

    // Back Date Upload
    if (fuel_usage_upload_type === 'Back Date' || fuel_usage_upload_type.includes('Back Date')) {
      const selectedSheet = Object.keys(xlsx)[0] || 'Sheet1' // first sheet;
      const endIndex = xlsx[selectedSheet].findIndex(v => v.A === '')
      const sheetData = xlsx[selectedSheet].slice(1)

      // process the data
      const data = []

      for (const value of sheetData) {
        let obj = {
          pitName: pitName,
          date: moment(value.A).add(1, 'days').format('YYYY-MM-DD'),
          ob: parseFloat(value.B) || 0,
          coal_mt: parseFloat(value.C) || 0,
          coal_bcm: parseFloat(value.D) || 0,
          fuel_cons: parseFloat(value.E).toFixed(2) || 0,
          fuel_ratio: parseFloat(value.F) || 0,
        }
        data.push(obj)
      }

      for (const value of data) {
        // get pit id alongside with site id
        const GET_PIT_DATA = (
          await MasPit.query()
            .where(wh => {
              wh.where('name', 'like', `%${pitName}%`)
              wh.where('sts', 'Y')
            })
            .first()
        ).toJSON()

        const newFuelSummary = new FuelSummary()
        newFuelSummary.fill({
          site_id: GET_PIT_DATA.site_id,
          pit_id: GET_PIT_DATA.id,
          date: value.date,
          ob: value.ob,
          coal_mt: value.coal_mt,
          coal_bcm: value.coal_bcm,
          fuel_used: value.fuel_cons,
          fuel_ratio: value.fuel_ratio,
          user_id: usr.id,
        })
        try {
          await newFuelSummary.save()
          console.log(`finished insert fuel ratio for date ${value.date} into database`)
        } catch (err) {
          return {
            message: 'Failed when inserting fuel summary \n Reason : ' + err.message,
          }
        }
      }
    }

    // Daily Upload
    console.log('---- started daily fuel summary upload ----')
    const sheetKeys = Object.keys(xlsx)
    const data = []

    for (const value of sheetKeys) {
      const pitName = value.toUpperCase()
      const sheetName = value
      const objData = xlsx[sheetName].slice(1)

      for (const value2 of objData) {
        const sheetDataDate = moment(value2.A).add(1, 'days').format('YYYY-MM-DD')

        if (sheetDataDate === date) {
          let obj = {
            pitName: pitName,
            date: moment(value2.A).add(1, 'days').format('YYYY-MM-DD'),
            ob: parseFloat(value2.B) || 0,
            coal_mt: parseFloat(parseFloat(value2.C).toFixed(2)) || 0,
            coal_bcm: typeof value2.F === 'string' ? 0 : parseFloat(parseFloat(value2.D).toFixed(2)),
            fuel_cons: parseFloat(parseFloat(value2.E).toFixed(2)) || 0,
            fuel_ratio: typeof value2.F === 'string' ? 0 : parseFloat(parseFloat(value2.F).toFixed(2)),
          }
          data.push(obj)
        }
      }
    }

    // process the data
    for (const value of data) {
      // get pit id alongside with site id
      const pitName = value.pitName.toUpperCase()
      const GET_PIT_DATA = await MasPit.query()
        .where(wh => {
          wh.where('name', 'like', `%${pitName}%`)
          wh.where('sts', 'Y')
        })
        .first()

      const site_id = GET_PIT_DATA.site_id
      const pit_id = GET_PIT_DATA.id

      // check if data is existing
      const checkData = await FuelSummary.query()
        .where(w => {
          w.where('site_id', GET_PIT_DATA.site_id)
          w.where('pit_id', GET_PIT_DATA.id)
          w.where('date', moment(date).format('YYYY-MM-DD'))
        })
        .last()

      if (checkData) {
        return {
          success: false,
          message: `Data fuel tgl ${date} - PIT ${pitName} sudah ada di database!. \n Silahkan coba lagi`,
        }
      } else {

        const sumFuel = await FuelSummary.query()
          .where(w => {
            w.where('site_id', site_id)
            w.where('pit_id', pit_id)
            w.where('date', '>=', moment(date).startOf('month').format('YYYY-MM-DD'))
            w.where('date', '<=', moment(date).format('YYYY-MM-DD'))
          })
          .getSum('fuel_used')

        const sumProdOB = await FuelSummary.query()
          .where(w => {
            w.where('site_id', site_id)
            w.where('pit_id', pit_id)
            w.where('date', '>=', moment(date).startOf('month').format('YYYY-MM-DD'))
            w.where('date', '<=', moment(date).format('YYYY-MM-DD'))
          })
          .getSum('ob')

        const sumProdCoal = await FuelSummary.query()
          .where(w => {
            w.where('site_id', site_id)
            w.where('pit_id', pit_id)
            w.where('date', '>=', moment(date).startOf('month').format('YYYY-MM-DD'))
            w.where('date', '<=', moment(date).format('YYYY-MM-DD'))
          })
          .getSum('coal_bcm')

        const newFuelSummary = new FuelSummary()
        newFuelSummary.fill({
          site_id: GET_PIT_DATA.site_id,
          pit_id: GET_PIT_DATA.id,
          date: value.date,
          ob: value.ob,
          coal_mt: value.coal_mt,
          coal_bcm: value.coal_bcm,
          fuel_used: value.fuel_cons,
          fuel_ratio: value.fuel_ratio,
          user_id: usr.id,
          cum_production: parseFloat(sumProdOB) + parseFloat(sumProdCoal) + parseFloat(value.coal_mt) / 1.3,
          cum_fuel_used: sumFuel + parseFloat(value.fuel_cons),
          cum_fuel_ratio: parseFloat(sumFuel + parseFloat(value.fuel_cons)) / parseFloat(parseFloat(sumProdOB) + parseFloat(sumProdCoal) + parseFloat(value.coal_mt) / 1.3),
        })
        try {
          await newFuelSummary.save()
          console.log(`finished insert fuel ratio for date ${value.date} - ${pitName} into database \n`)
        } catch (err) {
          return {
            message: 'Failed when inserting fuel summary \n Reason : ' + err.message,
          }
        }
      }
    }

    console.log('---- end of insert daily fuel summary upload ----')

    return {
      success: true,
      message: 'Succesfully Upload Fuel Summary Back Date',
    }
  }

  async SHOW(params) {
    const fuelSummary = (await FuelSummary.query().where('id', params.id).last()).toJSON()
    return fuelSummary
  }

  async UPDATE(params, req, user) {
    const trx = await db.beginTransaction()
    const startOfmonth = moment(req.date).startOf('month').format('YYYY-MM-DD')
    let cum_production = parseFloat(req.ob) + parseFloat(req.coal_mt) / 1.3
    let cum_fuel = parseFloat(req.fuel_used)

    console.log(req.date)
    console.log(req.date != startOfmonth)

    /* Mencari data tanggal sebelum nya */
    if (req.date != startOfmonth) {
      const prev = await FuelSummary.query()
        .where(w => {
          w.where('site_id', req.site_id)
          w.where('pit_id', req.pit_id)
          w.where('date', '>=', moment(req.date).startOf('month').format('YYYY-MM-DD'))
          w.where('date', '<=', moment(req.date).format('YYYY-MM-DD'))
        })
        .last()

      if (!prev) {
        return {
          success: false,
          message: 'Data tanggal sebelumnya tdk ditemukan...',
        }
      }

      cum_production = prev.cum_production + (parseFloat(req.ob) + parseFloat(req.coal_mt) / 1.3)
      cum_fuel = prev.cum_fuel_used + parseFloat(req.fuel_used)
    }

    const fuelSummary = await FuelSummary.query().where('id', params.id).last()
    fuelSummary.merge({
      site_id: req.site_id,
      pit_id: req.pit_id,
      date: moment(req.date).format('YYYY-MM-DD'),
      ob: parseFloat(req.ob),
      coal_mt: parseFloat(req.coal_mt),
      coal_bcm: parseFloat(req.coal_mt) / 1.3,
      fuel_used: parseFloat(req.fuel_used),
      fuel_ratio: parseFloat(req.fuel_used) / (parseFloat(req.ob) + parseFloat(req.coal_mt) / 1.3),
      cum_production: cum_production,
      cum_fuel_used: cum_fuel,
      cum_fuel_ratio: parseFloat(cum_fuel) / parseFloat(cum_production),
      user_id: user.id,
    })
    try {
      await fuelSummary.save(trx)
    } catch (error) {
      console.log(error)
      await trx.rollback()
      return {
        success: false,
        message: 'Failed update data...',
      }
    }

    const dataMonth = (
      await FuelSummary.query()
        .where(w => {
          w.where('site_id', req.site_id)
          w.where('pit_id', req.pit_id)
          w.where('date', '>=', moment(req.date).startOf('month').format('YYYY-MM-DD'))
          w.where('date', '<=', moment(req.date).endOf('month').format('YYYY-MM-DD'))
        })
        .fetch()
    ).toJSON()

    for (const obj of dataMonth) {
      const sumFuel = await FuelSummary.query()
        .where(w => {
          w.where('site_id', req.site_id)
          w.where('pit_id', req.pit_id)
          w.where('date', '>=', moment(req.date).startOf('month').format('YYYY-MM-DD'))
          w.where('date', '<=', moment(obj.date).format('YYYY-MM-DD'))
        })
        .getSum('fuel_used')

      const sumProdOB = await FuelSummary.query()
        .where(w => {
          w.where('site_id', req.site_id)
          w.where('pit_id', req.pit_id)
          w.where('date', '>=', moment(req.date).startOf('month').format('YYYY-MM-DD'))
          w.where('date', '<=', moment(obj.date).format('YYYY-MM-DD'))
        })
        .getSum('ob')

      const sumProdCoal = await FuelSummary.query()
        .where(w => {
          w.where('site_id', req.site_id)
          w.where('pit_id', req.pit_id)
          w.where('date', '>=', moment(req.date).startOf('month').format('YYYY-MM-DD'))
          w.where('date', '<=', moment(obj.date).format('YYYY-MM-DD'))
        })
        .getSum('coal_bcm')

      const updateFuelSummary = await FuelSummary.query().where('id', obj.id).last()

      updateFuelSummary.merge({
        cum_production: parseFloat(sumProdOB) + parseFloat(sumProdCoal),
        cum_fuel_used: sumFuel,
        cum_fuel_ratio: parseFloat(sumFuel) / (parseFloat(sumProdOB) + parseFloat(sumProdCoal)),
      })
      try {
        await updateFuelSummary.save(trx)
      } catch (error) {
        console.log(error)
        await trx.rollback()
        return {
          success: false,
          message: 'Failed update data dalam sebulan...',
        }
      }
    }

    await trx.commit()
    return {
      success: true,
      message: 'Success update data...',
    }
  }

  async STORE_ENTRY(req, user) {
    /* Check duplicated data */
    const checkData = await FuelSummary.query()
      .where(w => {
        w.where('site_id', req.site_id)
        w.where('pit_id', req.pit_id)
        w.where('date', moment(req.date).format('YYYY-MM-DD'))
      })
      .last()

    if (checkData) {
      return {
        success: false,
        message: 'Duplicated data entry...',
      }
    }

    const sumFuel = await FuelSummary.query()
      .where(w => {
        w.where('site_id', req.site_id)
        w.where('pit_id', req.pit_id)
        w.where('date', '>=', moment(req.date).startOf('month').format('YYYY-MM-DD'))
        w.where('date', '<=', moment(req.date).format('YYYY-MM-DD'))
      })
      .getSum('fuel_used')

    const sumProdOB = await FuelSummary.query()
      .where(w => {
        w.where('site_id', req.site_id)
        w.where('pit_id', req.pit_id)
        w.where('date', '>=', moment(req.date).startOf('month').format('YYYY-MM-DD'))
        w.where('date', '<=', moment(req.date).format('YYYY-MM-DD'))
      })
      .getSum('ob')

    const sumProdCoal = await FuelSummary.query()
      .where(w => {
        w.where('site_id', req.site_id)
        w.where('pit_id', req.pit_id)
        w.where('date', '>=', moment(req.date).startOf('month').format('YYYY-MM-DD'))
        w.where('date', '<=', moment(req.date).format('YYYY-MM-DD'))
      })
      .getSum('coal_bcm')

    const fuelSummary = new FuelSummary()
    fuelSummary.fill({
      site_id: req.site_id,
      pit_id: req.pit_id,
      date: moment(req.date).format('YYYY-MM-DD'),
      ob: parseFloat(req.ob),
      coal_mt: parseFloat(req.coal_mt),
      coal_bcm: parseFloat(req.coal_mt) / 1.3,
      fuel_used: parseFloat(req.fuel_used),
      fuel_ratio: parseFloat(req.fuel_used) / (parseFloat(req.ob) + parseFloat(req.coal_mt) / 1.3),
      cum_production: parseFloat(sumProdOB) + parseFloat(sumProdCoal) + parseFloat(req.coal_mt) / 1.3,
      cum_fuel_used: sumFuel + parseFloat(req.fuel_used),
      cum_fuel_ratio: parseFloat(sumFuel + parseFloat(req.fuel_used)) / parseFloat(parseFloat(sumProdOB) + parseFloat(sumProdCoal) + parseFloat(req.coal_mt) / 1.3),
      user_id: user.id,
    })
    try {
      await fuelSummary.save()
      return {
        success: true,
        message: 'Success update data...',
      }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: 'Failed save data...',
      }
    }
  }
}

module.exports = new FuelSummaryHelpers()

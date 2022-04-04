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
        console.log(`finished insert fuel ratio for date ${value.date} - ${pitName} into database \n`)
      } catch (err) {
        return {
          message: 'Failed when inserting fuel summary \n Reason : ' + err.message,
        }
      }
    }

    console.log('---- end of insert daily fuel summary upload ----')

    return {
      success: true,
      message: 'Succesfully Upload Fuel Summary Back Date',
    }
  }
}

module.exports = new FuelSummaryHelpers()

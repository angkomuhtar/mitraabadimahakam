'use strict'

const EquipmentPerformanceHelpers = use('App/Controllers/Http/Helpers/MamEquipmentPerformance')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const Helpers = use('Helpers')
const MasEquipment = use('App/Models/MasEquipment')
const EquipmentPerformance = use('App/Models/MamEquipmentPerformance')

class EquipmentPerformanceController {
  async index({ view }) {
    return view.render('operation.equipment-performance.index')
  }

  async create({ view }) {
    return view.render('operation.equipment-performance.create')
  }

  async list({ auth, request, view }) {
    const req = request.all()
    const user = await userValidate(auth)

    if (!user) {
      return view.render('401')
    }
    const data = await EquipmentPerformanceHelpers.LIST(req)
    return view.render('operation.equipment-performance.list', { list: data })
  }

  async show({ auth, params, view }) {
    await auth.getUser()

    const data = await EquipmentPerformanceHelpers.SHOW(params)
    return view.render('operation.equipment-performance.show', {
      data: data,
    })
  }

  async store({ auth, request }) {
    const req = request.all()

    const { month, site_id } = req

    let user = null

    // user validation
    try {
      user = await auth.getUser()
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
          wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer'])
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
    }

    // process the data
    for (const equipment of equipmentIds) {
      const newEquipmentPerformance = new EquipmentPerformance()
      const now = moment(month).format('DD MMM')
      const to = moment(month).format('DD MMM')

      newEquipmentPerformance.fill({
        month: currentMonth,
        site_id: site_id,
        period: `${now} - ${to}`,
        equip_id: equipment,
        upload_by: user.id,
        mohh: getTotalHours,
        target_downtime_monthly: getTotalHours * (1 - 0 / 100)
      })

      await newEquipmentPerformance.save()

      console.log(`---- equipment id ${equipment} saved to the monthly performance ----`)
    }

    return {
      success: true,
      message: 'Success creating monthly data equipment performance',
    }
  }
}

module.exports = EquipmentPerformanceController

async function userValidate(auth) {
  let user
  try {
    user = await auth.getUser()
    return user
  } catch (error) {
    console.log(error)
    return null
  }
}

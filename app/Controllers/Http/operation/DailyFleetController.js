'use strict'

const moment = require('moment')
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Database = use('Database')
const DailyFleet = use("App/Models/DailyFleet")
const DailyFleetEquip = use("App/Models/DailyFleetEquip")
const Equipment = use("App/Models/MasEquipment")
const Shift = use("App/Models/MasShift")

class DailyFleetController {

  async index ({ request, response, view }) {
    return view.render('operation.daily-fleet.index')
  }

  async list ({ request, view }) {
    const req = request.all()
    const limit = req.limit || 100
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data
    if(req.filter){
      data = await DailyFleet.query()
        .with('pit', site => site.with('site'))
        .with('fleet')
        .with('activities')
        .with('shift')
        .with('user')
        .with('details', eq => eq.with('equipment'))
        .where( w => {
          if(req.begin_date && req.end_date){
            w.where('date', '>=', req.begin_date)
            w.where('date', '<=', req.end_date)
          }
          if(req.pit_id){
            w.where('pit_id', req.pit_id)
          }
          if(req.fleet_id){
            w.where('fleet_id', req.fleet_id)
          }
          if(req.activity_id){
            w.where('activity_id', req.activity_id)
          }
          if(req.shift_id){
            w.where('shift_id', req.shift_id)
          }
        })
        .andWhere('status', 'Y')
        .orderBy('date', 'desc')
        .paginate(halaman, limit)
    }else{
      data = await DailyFleet.query()
      .with('pit', site => site.with('site'))
      .with('fleet')
      .with('activities')
      .with('shift')
      .with('user')
      .with('details', eq => eq.with('equipment'))
      .where('status', 'Y')
      .orderBy('date', 'desc')
      .paginate(halaman, limit)
    }

    
    return view.render('operation.daily-fleet.list', {list: data.toJSON(), limit: req.limit || 100})
  }

  async create ({ auth, view }) {
    const equipment = await Equipment.query().where('aktif', 'Y').fetch()
    return view.render('operation.daily-fleet.create', {list: equipment.toJSON()})
  }

  async store ({ auth, request }) {
    const usr = await auth.getUser()
    const req = request.only(['pit_id', 'fleet_id', 'activity_id', 'shift_id'])
    const datetime = request.only(['datetime'])
    const reqEquip = request.collect(['equip_id'])

    /* Check duplicate Fleet */
    const cekMaster = await DailyFleet.query().where({...req, date: moment(datetime).format('YYYY-MM-DD')}).first()
    if(cekMaster){
      return {
        success: false,
        message: 'Data exsist...'
      }
    }

    /* Get Time Shift */
    const dataShift = await Shift.query().where('id', req.shift_id).last()


    /* Check available Equipment Unit */
    const filterDateStart = moment(datetime.datetime).format('YYYY-MM-DD') + ' ' + dataShift.start_shift
    const filterDateEnd = moment(datetime.datetime).format('YYYY-MM-DD') + ' ' + dataShift.end_shift

    
    // check for duplicate equipment
    // for (const itemUnit of reqEquip) {
    //   const checkEquipment = 
    //   await DailyFleetEquip
    //   .query()
    //   .where( w => {
    //     w.where('datetime', '>=', filterDateStart)
    //     w.where('datetime', '<=', filterDateEnd)
    //     w.where('equip_id', itemUnit.equip_id)
    //   })
    //   .last()
    //   if (checkEquipment) {
    //     const unit = await Equipment.findOrFail(checkEquipment.equip_id)
    //     return {
    //       success: false,
    //       message: 'Used another fleet equipment data '+unit.kode
    //     }
    //   }
    // }

    const dailyFleet = new DailyFleet()
    dailyFleet.fill({...req, date: moment(datetime.datetime).format('YYYY-MM-DD'), user_id: usr.id})

    const trx = await Database.beginTransaction()
    try {
      await dailyFleet.save(trx)


      // prevent from creating a daily fleet without equipments selected
      if(reqEquip.length > 0) {
        for (const item of reqEquip) {
          const dailyFleetEquip = new DailyFleetEquip()
          dailyFleetEquip.fill({ 
            dailyfleet_id: dailyFleet.id,
            equip_id: item.equip_id,
            datetime: datetime.datetime
          })
          await dailyFleetEquip.save(trx)
        }
      } else {
        return {
            success: false,
            message: "Unit Tidak boleh kosong!.",
        }
      }


     
      await trx.commit()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success insert data'
      }
    } catch (error) {
      console.log(error)
      await trx.rollback()
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed insert data'
      }
    }

  }

  async show ({ params, request, auth, view }) {
    const usr = await auth.getUser()
    const { id } = params
    const data = await DailyFleet.query()
    .with('pit', site => site.with('site'))
    .with('fleet')
    .with('activities')
    .with('shift')
    .with('user')
    .with('details', eq => eq.with('equipment'))
    .where('id', id).last()

    const equipment = await Equipment.query().where('aktif', 'Y').fetch()

    const [currDate] = data.toJSON().details

    return view.render('operation.daily-fleet.show', {
      data: data.toJSON(), 
      list: equipment.toJSON(),
      date: currDate.datetime
    })
  }

  async update ({ params, request, auth }) {
    const usr = await auth.getUser()
    const { id } = params
    const reqWaktu = request.only(['datetime'])
    const req = request.only(['pit_id', 'fleet_id', 'shift_id', 'activity_id'])
    const reqUnit = request.collect(['equip_id'])

    // Check available Equipment Unit
    const shift = await Shift.find(req.shift_id)
    const filterDateStart = moment(reqWaktu.datetime).format('YYYY-MM-DD '+shift.start_shift)
    const filterDateEnd = moment(filterDateStart).add(shift.duration, 'hours').format('YYYY-MM-DD HH:mm:ss')

    for (const itemUnit of reqUnit) {
      const checkEquipment = 
        await DailyFleetEquip
          .query()
          .where(w => {
            w.where('datetime', '>=', filterDateStart).andWhere('datetime', '<=', filterDateEnd)
          })
          .andWhere({equip_id: itemUnit.equip_id})
          .first()
      if (checkEquipment) {
        // const unit = await Equipment.findOrFail(checkEquipment.equip_id)
        checkEquipment.merge(itemUnit)
        await checkEquipment.save()
      }
    }

    const updData = {...req, user_id: usr.id}

    const dataExsist = await DailyFleet.findOrFail(id)
    dataExsist.merge(updData)
    const trx = await Database.beginTransaction()
    try {
      await dataExsist.save(trx)
      const itemRemove = (await DailyFleetEquip.query().where('dailyfleet_id', dataExsist.id).fetch()).toJSON()

      for (const itemRem of itemRemove) {
        const itemExsist = await DailyFleetEquip.findOrFail(itemRem.id)
        await itemExsist.delete(trx)
      }

      for (const itemAdd of reqUnit) {
        const dailyFleetEquip = new DailyFleetEquip()
        dailyFleetEquip.fill({...itemAdd, dailyfleet_id: dataExsist.id, datetime: reqWaktu.datetime || moment().format('YYYY-MM-DD HH:mm')})
        await dailyFleetEquip.save(trx)
      }

      await trx.commit()
      return {
        success: true,
        message: 'Success update data'
      }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: 'Failed update data'
      }
    }
  }

  async delete ({ params, request, auth }) {
    const { id } = params
    const dailyFleet = await DailyFleet.findOrFail(id)
    try {
      await dailyFleet.delete()
      return {
        success: true,
        message: 'Success delete data'
      }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: 'Failed delete data'
      }
    }
  }
}

module.exports = DailyFleetController

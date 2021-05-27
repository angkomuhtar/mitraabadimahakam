'use strict'

const Equipment = use("App/Models/MasEquipment")
var moment = require('moment')
const Db = use('Database')

// CustomClass
// const PostEquipment = use("App/Controllers/Http/customClass/Equipment-Post")
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")


class MasEquipmentController {
  
  async index ({ auth, request, response, view }) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    const usr = await auth.getUser()
    const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
    await logger.tempData()
    const data = await Equipment.query().where('aktif', 'Y').paginate(halaman, limit)
    return view.render('master.equipment.index', {list: data.toJSON()})
  }

  async list ({request, view}) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data
    if(req.keyword != ''){
      data = await Equipment.query().where(whe => {
        whe.where('kode', 'like', `%${req.keyword}%`)
        whe.orWhere('tipe', 'like', `%${req.keyword}%`)
        whe.orWhere('brand', 'like', `%${req.keyword}%`)
        whe.orWhere('unit_sn', 'like', `%${req.keyword}%`)
        whe.orWhere('unit_model', 'like', `%${req.keyword}%`)
        whe.orWhere('engine_model', 'like', `%${req.keyword}%`)
        whe.orWhere('engine_sn', 'like', `%${req.keyword}%`)
      }).andWhere('aktif', 'Y')
      .paginate(halaman, limit)
    }else{
      data = await Equipment.query().where('aktif', 'Y').paginate(halaman, limit)
    }

    return view.render('master.equipment.list', {list: data.toJSON()})
  }

  async store ({ auth, request, response }) {
    const all = request.all()
    const equip = request.only(['kode', 'tipe', 'brand', 'received_date', 'received_hm', 'is_warranty', 'warranty_date', 'is_owned', 'remark', 'unit_sn', 'unit_model', 'engine_sn', 'engine_model', 'fuel_capacity', 'qty_capacity', 'satuan'])
    const usr = await auth.getUser()
    console.log('====================================');
    console.log(all);
    console.log('====================================');
    const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
    await logger.tempData()

    const equipment = new Equipment()
    equipment.fill({...equip, created_by: usr.id})
    const trx = await Db.beginTransaction()
    try {
      await equipment.save(trx)
      await trx.commit()
      const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
      await logger.tempData()
      return {
        success: true,
        message: 'Success insert data'
      }
    } catch (error) {
      console.log(error);
      const logger = new Loggerx(request.url(), request.all(), usr, request.method(), error)
      await logger.tempData()
      await trx.rollback()
      return {
        success: false,
        message: 'Failed insert data'
      }
    }
  }

  async show ({ auth, params, request, view }) {
    const usr = await auth.getUser()
    const { id } = params
    const data = await Equipment.query().with('dealer').where('id', id).first()
    const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
    await logger.tempData()
    return view.render('master.equipment.show', {list: data.toJSON()})

  }

  async update ({ auth, params, request }) {
    const usr = await auth.getUser()
    const { id } = params
    const req = request.only(['kode', 'tipe', 'brand', 'received_date', 'received_hm', 'is_warranty', 'warranty_date', 'is_owned', 'remark', 'unit_sn', 'unit_model', 'engine_sn', 'engine_model', 'fuel_capacity', 'qty_capacity', 'satuan', 'dealer_id'])
    const equipment = await Equipment.findOrFail(id)
    equipment.merge(req)
    try {
      await equipment.save()
      const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
      await logger.tempData()
      return {
        success: true,
        message: 'Success update data'
      }
    } catch (error) {
      console.log(error);
      const logger = new Loggerx(request.url(), request.all(), usr, request.method(), error)
      await logger.tempData()
      return {
        success: false,
        message: 'Failed update data'
      }
    }
  }

  async delete ({ auth, params, request }) {
    const usr = await auth.getUser()
    const logger = new Loggerx(request.url(), request.all(), usr, request.method())
    await logger.tempData()
    const { id } = params
    const equipment = await Equipment.findOrFail(id)
    const data = {aktif: equipment.aktif === 'Y' ? 'N' : 'Y'}
    equipment.merge(data)
    try {
      await equipment.save()
      const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
      await logger.tempData()
      return {
        success: true,
        message: 'Success update data'
      }
    } catch (error) {
      console.log(error);
      const logger = new Loggerx(request.url(), request.all(), usr, request.method(), error)
      await logger.tempData()
      return {
        success: false,
        message: 'Failed update data'
      }
    }
  }

  async destroy ({ params, request, response }) {

  }
}

module.exports = MasEquipmentController

'use strict'

const Helpers = use('Helpers')
const Equipment = use("App/Models/MasEquipment")
const cryptoRandomString = require('crypto-random-string')
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
    const limit = parseInt(req.limit) || 25
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    console.log('limit :::', limit);
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

    console.log('data :::', data.toJSON());
    return view.render('master.equipment.list', {
      limit: limit,
      search: req.keyword,
      list: data.toJSON()
    })
  }

  async store ({ auth, request, response }) {
    const equip = request.only(['kode', 'tipe', 'brand', 'received_date', 'received_hm', 'is_warranty', 'warranty_date', 'is_owned', 'remark', 'unit_sn', 'unit_model', 'engine_sn', 'engine_model', 'fuel_capacity', 'qty_capacity', 'satuan'])
    
    const host = request.headers().origin
    const validatePhoto = {
      types: ["image"],
      size: "10mb",
      extname: ["jpg", "jpeg", "png"],
    }

    const photo = request.file("photo", validatePhoto)
    let uriImages = null
    if(photo){
      const randURL = await cryptoRandomString({length: 30, type: 'url-safe'})
      const aliasName = `${randURL}.${photo.subtype}`
      uriImages = host + '/images/equipments/'+aliasName
      await photo.move(Helpers.publicPath(`/images/equipments/`), {
        name: aliasName,
        overwrite: true,
      })
  
      if (!photo.moved()) {
        return photo.error()
      }
    }

    const usr = await auth.getUser()
    const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
    await logger.tempData()

    equip.received_hm = parseFloat(equip.received_hm)
    equip.qty_capacity = parseFloat(equip.qty_capacity)

    const equipment = new Equipment()
    equipment.fill({...equip, created_by: usr.id, img_uri: uriImages})
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

    const host = request.headers().origin
    const validatePhoto = {
      types: ["image"],
      size: "10mb",
      extname: ["jpg", "jpeg", "png"],
    }

    const photo = request.file("photo", validatePhoto)
    let uriImages = null
    if(photo){
      const randURL = await cryptoRandomString({length: 30, type: 'url-safe'})
      const aliasName = `${randURL}.${photo.subtype}`
      uriImages = host + '/images/equipments/'+aliasName
      req.img_uri = uriImages
      await photo.move(Helpers.publicPath(`/images/equipments/`), {
        name: aliasName,
        overwrite: true,
      })
  
      if (!photo.moved()) {
        return photo.error()
      }
    }
    
    const equipment = await Equipment.findOrFail(id)

    req.received_hm = parseFloat(req.received_hm)
    req.qty_capacity = parseFloat(req.qty_capacity)

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

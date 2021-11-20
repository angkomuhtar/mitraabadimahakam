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
    const dataUnit = await equipUnit()

    let errUnit = []

    for (const [i, obj] of dataUnit.entries()) {
      try {
        (await Equipment.query().where('kode', obj).last()).toJSON()
      } catch (error) {
        // console.log('Data '+ obj + ' tidak ditemukan...' + i+1);
        errUnit.push(obj)
      }
    }

    console.log('*log data equipment*');
    console.log(errUnit);
    console.log(errUnit.length);
    console.log('*log data equipment*');


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
    const req = request.only(['kode', 'tipe', 'brand', 'received_date', 'received_hm', 'is_warranty', 'warranty_date', 'is_owned', 'remark', 'unit_sn', 'unit_model', 'engine_sn', 'engine_model', 'fuel_capacity', 'qty_capacity', 'satuan'])

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

const equip = [
  "ME 0001",
  "ME 0006",
  "ME 0010",
  "ME 0011",
  "ME 0016",
  "ME 0017",
  "ME 0018",
  "ME 0019",
  "ME 0020",
  "ME 0021",
  "ME 0022",
  "ME 0023",
  "ME 0025",
  "ME 0026",
  "ME 0027",
  "ME 0028",
  "ME 0029",
  "ME 0030",
  "ME 0031",
  "ME 0032",
  "ME 0033",
  "OHT 001",
  "OHT 002",
  "OHT 003",
  "OHT 005",
  "OHT 006",
  "OHT 007",
  "OHT 008",
  "OHT 009",
  "OHT 010",
  "OHT 011",
  "OHT 012",
  "OHT 015",
  "OHT 016",
  "OHT 017",
  "OHT 018",
  "OHT 019",
  "OHT 020",
  "OHT 021",
  "OHT 022",
  "OHT 023",
  "OHT 025",
  "OHT 026",
  "OHT 027",
  "OHT 028",
  "OHT 029",
  "OHT 030",
  "OHT 031",
  "OHT 032",
  "OHT 033",
  "OHT 034",
  "OHT 035",
  "OHT 036",
  "OHT 037",
  "OHT 038",
  "ADT 010",
  "ADT 011",
  "ADT 012",
  "MCD10R001",
  "MD0002",
  "MD0005",
  "MD0006",
  "MD0007",
  "MD0008",
  "MD0009",
  "MD0010",
  "MD0011",
  "MD0012",
  "MD0015",
  "MG 001",
  "MG 002",
  "MG 003",
  "MG 005",
  "MG 006",
  "MG 007",
  "MDR0001",
  "MDR0002",
  "WT 001",
  "WT 002",
  "WT 003",
  "WT 005",
  "MCP01",
  "MCP02",
  "MF01",
  "MF02",
  "MWP03",
  "MWP05",
  "CT 001",
  "CT 002",
  "FT 001",
  "FT 002",
  "FT 003",
  "LT 001",
  "LT 002",
  "LT 003",
  "MF 001",
  "MB 019",
  "TES FLOW FT 03",
  "ATE",
  "HO-01",
  "T-01",
  "T-02",
  "A-01",
  "A-02",
  "A-03",
  "B-01",
  "B-02",
  "B-03",
  "B-05",
  "B-08",
  "C-01",
  "C-02",
  "D-01",
  "D-02",
  "D-03",
  "D-05",
  "D-06",
  "E-01",
  "F-01",
  "F-02",
  "G-01",
  "H-01",
  "D-07",
  "MASRI",
  "LV ATE",
  "LV IPS",
  "LV-HO",
  "LPDKT",
  "MLT01",
  "MLT02",
  "MLT03",
  "MLT04",
  "MLT05",
  "MLT06",
  "MLT07",
  "MLT08",
  "MLT09",
  "MLT10",
  "MLT11",
  "MLT12",
  "MLT13",
  "MLT15",
  "MLT16",
  "MLT17",
  "GEP33-3",
  "G-036",
  "MILLER",
  "DOOSAN-1",
  "DOOSAN-2",
  "ATLAS-3"
  ]
  
  async function equipUnit(){
      const x = equip.map(obj => obj.replace(/[^a-z0-9]/gi,''))
      return x
  }
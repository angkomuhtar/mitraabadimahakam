'use strict'

const Equipment = use("App/Models/MasEquipment")
var moment = require('moment')
const Db = use('Database')

// CustomClass
// const PostEquipment = use("App/Controllers/Http/customClass/Equipment-Post")
// const Logger = use("App/Controllers/Http/customClass/LoggerClass")


const Logger = use('Logger')
const jam = moment().format('hh:mm:ss')
// Logger.level = 'debug'

class MasEquipmentController {
  
  async index ({ auth, request, response, view }) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    const usr = await auth.getUser()
    Logger.transport('file').info({get: true, times: jam, user: usr, req: request.all()})
    const data = await Equipment.query().paginate(halaman, limit)
    return view.render('master.equipment.index', {list: data.toJSON()})
  }

  async store ({ auth, request, response }) {
    Logger.transport('file').info('-----------------------------------------------------------------------')
    const all = request.all()
    const equip = request.only(['kode', 'tipe', 'brand', 'received_date', 'received_hm', 'is_warranty', 'warranty_date', 'is_owned', 'remark', 'unit_sn', 'unit_model', 'engine_sn', 'engine_model', 'fuel_capacity', 'qty_capacity', 'satuan'])
    const dealer = request.only(['dealer_name', 'cp_name', 'cp_email', 'cp_phone', 'description'])
    const usr = await auth.getUser()
    
    const equipment = new Equipment()
    equipment.fill({...equip, created_by: usr.id})
    const trx = await Db.beginTransaction()
    try {
      await equipment.save(trx)
      await trx.commit()
      Logger.transport('file').info({post: true, jam: jam, user: usr, req: all})
      return {
        success: true,
        message: 'Success insert data'
      }
    } catch (error) {
      console.log(error);
      Logger.transport('file').info({post: false, times: jam, user: usr, error: error})
      await trx.rollback()
      return {
        success: false,
        message: 'Failed insert data'
      }
    }
  }
  
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing masequipment.
   * GET masequipments/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update masequipment details.
   * PUT or PATCH masequipments/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a masequipment with id.
   * DELETE masequipments/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = MasEquipmentController

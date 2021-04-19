'use strict'


// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

// Collections
const Options = use("App/Models/SysOption")
const Employee = use("App/Models/MasEmployee")

class MasEmployeeController {
  async index ({ auth, request, response, view }) {
    const usr = await auth.getUser()
    const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
    await logger.tempData()
    return view.render('master.employee.index')
  }

  async list ({request, view}) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data 
    if(req.keyword != ''){
      data = await Employee.query().where(whe => {
        whe.where('nik', 'like', `%${req.keyword}%`)
        whe.orWhere('fullname', 'like', `%${req.keyword}%`)
        whe.orWhere('email', 'like', `%${req.keyword}%`)
        whe.orWhere('phone', 'like', `%${req.keyword}%`)
        whe.orWhere('no_idcard', 'like', `%${req.keyword}%`)
        whe.orWhere('alamat', 'like', `%${req.keyword}%`)
        whe.orWhere('tipe_idcard', 'like', `%${req.keyword}%`)
      }).andWhere('aktif', 'Y')
      .paginate(halaman, limit)
    }else{
      data = await Employee.query().paginate(halaman, limit)
    }
    console.log(data.toJSON());
    return view.render('master.employee.list', {list: data.toJSON()})
  }

  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new masemployee.
   * POST masemployees
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ auth, request, response }) {
    const usr = await auth.getUser()
    const req = request.all()
    console.log(req)
    

    const employee = new Employee()
    employee.fill({...req, created_by: usr.id})
    try {
      await employee.save()
      const logger = new Loggerx(request.url(), req, usr, request.method(), true)
      await logger.tempData()
      return {
        success: true,
        message: 'Okey,,, Insert data success!'
      }
    } catch (error) {
      console.log(error);
      const logger = new Loggerx(request.url(), req, usr, request.method(), error)
      await logger.tempData()
      return {
        success: false,
        message: 'Opps,,, Insert data failed!'
      }
    }
  }

  /**
   * Display a single masemployee.
   * GET masemployees/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing masemployee.
   * GET masemployees/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update masemployee details.
   * PUT or PATCH masemployees/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a masemployee with id.
   * DELETE masemployees/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = MasEmployeeController

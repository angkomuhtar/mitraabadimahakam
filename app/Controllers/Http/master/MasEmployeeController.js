'use strict'


// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

// Collections
const Options = use("App/Models/SysOption")
const Employee = use("App/Models/MasEmployee")
const moment = use("moment")

class MasEmployeeController {
  async index ({ auth, request, response, view }) {
    const usr = await auth.getUser()
    const logger = new Loggerx(request.url(), request.all(), usr, request.method(), true)
    await logger.tempData()
    return view.render('master.employee.index')
  }

  async list ({ auth, request, view }) {
    const usr = await auth.getUser()
    const req = request.all()
    const limit = 25
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data 
    const logger = new Loggerx(request.url(), req, usr, request.method(), true)
    await logger.tempData()
    if(req.keyword != ''){
      data = await Employee.query().where(whe => {
        whe.where('nik', 'like', `%${req.keyword}%`)
        whe.orWhere('fullname', 'like', `%${req.keyword}%`)
        whe.orWhere('email', 'like', `%${req.keyword}%`)
        whe.orWhere('phone', 'like', `%${req.keyword}%`)
        whe.orWhere('no_idcard', 'like', `%${req.keyword}%`)
        whe.orWhere('alamat', 'like', `%${req.keyword}%`)
        whe.orWhere('tipe_idcard', 'like', `%${req.keyword}%`)
      }).andWhere('aktif', 'Y').orderBy('fullname', 'asc')
      .paginate(halaman, limit)
    }else{
      data = await Employee.query().where('aktif', 'Y').orderBy('fullname', 'asc').paginate(halaman, limit)
    }
    // console.log(data.toJSON());
    return view.render('master.employee.list', {list: data.toJSON()})
  }


  async store ({ auth, request, response }) {
    const usr = await auth.getUser()
    const req = request.all()

    req.tgl_lahir = new Date(req.tgl_lahir)
    req.tgl_lahir = new Date(req.join_date)
    console.log(req)
    

    const employee = new Employee()
    employee.fill({...req, created_by: usr.id})
    try {
      await employee.save()
      const logger = new Loggerx(request.url(), req, usr, request.method(), true)
      await logger.tempData()
      return {
        success: true,
        message: 'Insert data success!'
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

  async show ({ params, request, auth, view }) {
    const usr = await auth.getUser()
    const { id } = params
    const req = request.all()

    const logger = new Loggerx(request.url(), req, usr, request.method(), true)
    await logger.tempData()

    const data = await Employee.findOrFail(id)
    console.log(data);
    return view.render('master.employee.show', {data: data.toJSON()})
  }

  async update ({ auth, params, request }) {
    const usr = await auth.getUser()
    const { id } = params
    const req = request.except(['_csrf', 'submit'])
    console.log(req);
    const employee = await Employee.findOrFail(id)
    req.tgl_lahir = new Date(req.tgl_lahir)
    req.tgl_lahir = new Date(req.join_date)

    employee.merge(req)
    try {
      await employee.save()
      const logger = new Loggerx(request.url(), req, usr, request.method(), true)
      await logger.tempData()
      return {
        success: true,
        message: 'Success update data'
      }
    } catch (error) {
      console.log(error);
      const logger = new Loggerx(request.url(), req, usr, request.method(), error)
      await logger.tempData()
      return {
        success: false,
        message: 'Failed update data'
      }
    }
  }

  async delete ({ auth, params, request, response }) {
    const usr = await auth.getUser()
    const { id } = params
    const req = request.except(['_csrf', 'submit'])
    const employee = await Employee.findOrFail(id)
    employee.merge({aktif: 'N'})
    try {
      await employee.save()
      const logger = new Loggerx(request.url(), employee, usr, request.method(), true)
      await logger.tempData()
      return {
        success: true,
        message: 'Success update data'
      }
    } catch (error) {
      console.log(error);
      const logger = new Loggerx(request.url(), employee, usr, request.method(), error)
      await logger.tempData()
      return {
        success: false,
        message: 'Failed update data'
      }
    }
  }
}

module.exports = MasEmployeeController

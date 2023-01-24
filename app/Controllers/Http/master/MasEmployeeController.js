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
    const limit = req.limit || 50
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data 
    const logger = new Loggerx(request.url(), req, usr, request.method(), true)
    await logger.tempData()
    if(req.keyword != ''){
      data = await Employee.query().where( w => {
        if(req.agama){
          w.where('agama', req.agama)
        }
        if(req.fullname){
          w.where('fullname', 'like', `%${req.fullname}%`)
        }
        if(req.no_idcard){
          w.where('no_idcard', 'like', `%${req.no_idcard}%`)
        }
        if(req.old_nik){
          w.where('old_nik', 'like', `%${req.old_nik}%`)
        }
        if(req.sts_employee){
          w.where('sts_employee', req.sts_employee)
        }
        if(req.start_join_date && req.end_join_date){
          w.where('join_date', '>=', req.start_join_date)
          w.where('join_date', '<=', req.end_join_date)
        }
        if(req.awal_kontrak){
          w.where('awal_kontrak', 'like', `${moment(req.awal_kontrak).format('YYYY-MM')}%`)
        }
        if(req.akhir_kontrak){
          w.where('akhir_kontrak', 'like', `${moment(req.akhir_kontrak).format('YYYY-MM')}%`)
        }
      }).where('aktif', '!=', 'D').orderBy('fullname', 'asc')
      .orderBy('old_nik', 'asc')
      .paginate(halaman, limit)
    }else{
      data = await Employee.query().where('aktif', '!=', 'D').orderBy('old_nik', 'asc').paginate(halaman, limit)
    }
    return view.render('master.employee.list', {list: data.toJSON()})
  }


  async store ({ auth, request, response }) {
    const usr = await auth.getUser()
    const req = request.all()

    if(!req.nrp){
      return {
        success: false,
        message: 'NRP tdk boleh kosong..'
      }
    }

    if(!req.fullname){
      return {
        success: false,
        message: 'Nama Lengkap tdk boleh kosong..'
      }
    }

    if(!req.sex){
      return {
        success: false,
        message: 'Jenis kelamin tdk boleh kosong..'
      }
    }

    if(!req.t4_lahir){
      return {
        success: false,
        message: 'Tempat lahir tdk boleh kosong..'
      }
    }

    if(!req.tgl_lahir){
      return {
        success: false,
        message: 'Tanggal lahir tdk boleh kosong..'
      }
    }

    if(!req.tipe_employee){
      return {
        success: false,
        message: 'Type employee tdk boleh kosong..'
      }
    }

    if(!req.join_date){
      return {
        success: false,
        message: 'Tanggal bergabung tdk boleh kosong..'
      }
    }

    if(!req.phone){
      return {
        success: false,
        message: 'Phone tdk boleh kosong..'
      }
    }

    if(!req.email){
      return {
        success: false,
        message: 'Email tdk boleh kosong..'
      }
    }

    const employee = new Employee()
    employee.fill({
      old_nik: req.old_nik,
      nrp: req.nrp,
      sts_employee: req.sts_employee,
      aktif: req.aktif,
      awal_kontrak: req.awal_kontrak,
      akhir_kontrak: req.akhir_kontrak,
      fullname: req.fullname,
      email: req.email,
      phone: req.phone,
      agama: req.agama,
      t4_lahir: req.t4_lahir,
      tgl_lahir: req.tgl_lahir,
      no_idcard: req.no_idcard,
      tipe_idcard: req.tipe_idcard,
      warganegara: req.warganegara,
      join_date: req.join_date,
      sts_kawin: req.sts_kawin,
      sex: req.sex,
      tinggi_bdn: req.tinggi_bdn,
      berat_bdn: req.berat_bdn,
      tipe_employee: req.tipe_employee,
      is_operator: req.is_operator,
      alamat: req.alamat,
      created_by: usr.id
    })

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
    employee.merge({aktif: 'D'})
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

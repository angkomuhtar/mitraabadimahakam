'use strict'

// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Shift = use("App/Models/MasShift")


class MasShiftController {
  async index ({ request, auth, view }) {
    const usr = auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    return view.render('master.shift.index')
  }

  async list ({ request, view }) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data
    if(req.keyword != ''){
      data = await Shift.query().where(whe => {
        whe.where('kode', 'like', `%${req.keyword}%`)
        whe.orWhere('name', 'like', `%${req.keyword}%`)
      }).andWhere('status', 'Y')
      .paginate(halaman, limit)
    }else{
      data = await Shift.query().where('status', 'Y').paginate(halaman, limit)
    }
    // console.log(data);
    return view.render('master.shift.list', {list: data.toJSON()})
  }

  async store ({ request, auth }) {
    const usr = auth.getUser()
    const req = request.only(['kode', 'name', 'duration', 'start_shift', 'end_shift'])
    console.log(req);
    const shift = new Shift()
    shift.fill(req)
    try {
      await shift.save()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success insert data'
      }
    } catch (error) {
      console.log(error);
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed insert data'
      }
    }
  }

  async show ({ params, auth, request, view }) {
    const usr = auth.getUser()
    const { id } = params
    const shift = await Shift.findOrFail(id)
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    return view.render('master.shift.show', {data: shift.toJSON()})
  }
  
  async update ({ params, request, auth }) {
    const usr = auth.getUser()
    const { id } = params
    const req = request.only(['kode', 'name', 'duration', 'start_shift', 'end_shift'])
    const shift = await Shift.findOrFail(id)
    shift.merge(req)
    try {
      await shift.save()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success update data'
      }
    } catch (error) {
      console.log(error);
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed update data'
      }
    }
  }

  async delete ({ params, request, auth }) {
    const usr = auth.getUser()
    const { id } = params
    const shift = await Shift.findOrFail(id)
    console.log(shift.toJSON());
    shift.merge({status: 'N'})
    try {
      await shift.save()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success delete data'
      }
    } catch (error) {
      console.log(error);
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed delete data'
      }
    }
  }
}

module.exports = MasShiftController

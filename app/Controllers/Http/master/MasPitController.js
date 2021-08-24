'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Pit = use("App/Models/MasPit")


/**
 * Resourceful controller for interacting with maspits
 */
class MasPitController {
  async index ({ request, auth, view }) {
    const usr = auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    return view.render('master.pit.index')
  }

  async list ({ request, view }) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data
    if(req.keyword != ''){
      data = await Pit.query().where(whe => {
        whe.where('kode', 'like', `%${req.keyword}%`)
        whe.orWhere('name', 'like', `%${req.keyword}%`)
        whe.orWhere('keterangan', 'like', `%${req.keyword}%`)
      }).andWhere('sts', 'Y')
      .paginate(halaman, limit)
    }else{
      data = await Pit.query().where('sts', 'Y').paginate(halaman, limit)
    }
    return view.render('master.pit.list', {list: data.toJSON()})
  }

  async store ({ request, auth }) {
    const usr = auth.getUser()
    const req = request.only(['site_id', 'kode', 'name', 'location', 'ob_plan', 'coal_plan'])

    
    if(!req.site_id){
      return {
        success: false,
        message: 'Failed insert data'
      }
    }
    
    console.log('LOG ::::', req);
    const pit = new Pit()
    pit.fill(req)
    try {
      await pit.save()
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
    const pit = await Pit.findOrFail(id)
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    return view.render('master.pit.show', {data: pit.toJSON()})
  }

  async update ({ params, request, auth }) {
    const usr = auth.getUser()
    const { id } = params
    const req = request.only(['site_id', 'kode', 'name', 'location', 'ob_plan', 'coal_plan'])
    const pit = await Pit.findOrFail(id)
    pit.merge(req)
    try {
      await pit.save()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success update data'
      }
    } catch (error) {
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
    const pit = await Pit.findOrFail(id)
    pit.merge({sts: 'N'})

    try {
      await pit.save()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success delete data'
      }
    } catch (error) {
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed delete data'
      }
    }
  }
}

module.exports = MasPitController

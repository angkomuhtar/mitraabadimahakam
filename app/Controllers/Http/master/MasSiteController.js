'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Site = use("App/Models/MasSite")

/**
 * Resourceful controller for interacting with massites
 */
class MasSiteController {
  async index ({ request, auth, view }) {
    const usr = auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    return view.render('master.site.index')
  }

  async list ({ request, view }) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data
    if(req.keyword != ''){
      data = await Site.query().where(whe => {
        whe.where('kode', 'like', `%${req.keyword}%`)
        whe.orWhere('name', 'like', `%${req.keyword}%`)
        whe.orWhere('keterangan', 'like', `%${req.keyword}%`)
      }).andWhere('status', 'Y')
      .paginate(halaman, limit)
    }else{
      data = await Site.query().where('status', 'Y').paginate(halaman, limit)
    }
    return view.render('master.site.list', {list: data.toJSON()})
  }

  async store ({ request, auth }) {
    const usr = auth.getUser()
    const req = request.only(['kode', 'name', 'keterangan'])
    const site = new Site()
    site.fill(req)
    try {
      await site.save()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success insert data'
      }
    } catch (error) {
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed insert data'
      }
    }
  }

  async show ({ params, request, auth, view }) {
    const usr = auth.getUser()
    const { id } = params
    const site = await Site.findOrFail(id)
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    return view.render('master.site.show', {data: site.toJSON()})
  }
  
  async update ({ params, request, auth }) {
    const usr = auth.getUser()
    const { id } = params
    const req = request.only(['kode', 'name', 'keterangan'])
    const site = await Site.findOrFail(id)
    site.merge(req)
    try {
      await site.save()
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
    const site = await Site.findOrFail(id)
    site.merge({status: 'N'})

    try {
      await site.save()
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

module.exports = MasSiteController

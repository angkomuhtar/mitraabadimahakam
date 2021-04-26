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
    const req = request.only(['side_id', 'kode', 'name', 'location'])
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

  /**
   * Display a single maspit.
   * GET maspits/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing maspit.
   * GET maspits/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update maspit details.
   * PUT or PATCH maspits/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a maspit with id.
   * DELETE maspits/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = MasPitController

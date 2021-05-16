'use strict'

const Activity = use('App/Models/MasActivity')

class MasActivityController {
  async index ({ request, response, view }) {
    return view.render('master.activity.index')
  }

  async list ({ request, view }) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data
    if(req.keyword != ''){
      data = await Activity.query().where(whe => {
        whe.where('kode', 'like', `%${req.keyword}%`)
        whe.orWhere('name', 'like', `%${req.keyword}%`)
      }).andWhere('sts', 'Y')
      .paginate(halaman, limit)
    }else{
      data = await Activity.query().where('sts', 'Y').paginate(halaman, limit)
    }
    // console.log(data);
    return view.render('master.activity.list', {list: data.toJSON()})
  }

  /**
   * Create/save a new masactivity.
   * POST masactivities
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single masactivity.
   * GET masactivities/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing masactivity.
   * GET masactivities/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update masactivity details.
   * PUT or PATCH masactivities/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a masactivity with id.
   * DELETE masactivities/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = MasActivityController

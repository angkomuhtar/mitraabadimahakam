'use strict'

// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")


class MasShiftController {
  async index ({ request, auth, view }) {
    const usr = auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    return view.render('master.shift.index')
  }

  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new masshift.
   * POST masshifts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single masshift.
   * GET masshifts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing masshift.
   * GET masshifts/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update masshift details.
   * PUT or PATCH masshifts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a masshift with id.
   * DELETE masshifts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = MasShiftController

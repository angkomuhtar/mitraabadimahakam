"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");
const { performance } = require("perf_hooks");
const SysError = use("App/Models/SysError");
const db = use("Database");

/**
 * Resourceful controller for interacting with syserrors
 */
class SysErrorController {
  /**
   * Show a list of all syserrors.
   * GET syserrors
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {}

  /**
   * Render a form to be used for creating a new syserror.
   * GET syserrors/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {}

  /**
   * Create/save a new syserror.
   * POST syserrors
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, auth }) {
    const { name, message, description, error_by } = request.only([
      "name",
      "message",
      "description",
      "error_by",
    ]);

    var t0 = performance.now();
    let durasi;

    try {
      await auth.authenticator("jwt").getUser();
    } catch (err) {
      console.log(err);
      durasi = await diagnoticTime.durasi(t0);
      response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: err.message,
        },
        data: {},
      });
    }

    const trx = await db.beginTransaction();

    try {
      let systemError = new SysError();

      await systemError.fill({
        name,
        message,
        description,
        error_by,
      });

      await systemError.save(trx);

      await trx.commit(trx);

      const result = await SysError.query().last()

      durasi = await diagnoticTime.durasi(t0);
      response.status(201).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        data: result,
      });

    } catch (err) {
      console.log(err);
      await trx.rollback();
      durasi = await diagnoticTime.durasi(t0);
      response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: err.message,
        },
        data: {},
      });
    }
  }

  /**
   * Display a single syserror.
   * GET syserrors/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Render a form to update an existing syserror.
   * GET syserrors/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {}

  /**
   * Update syserror details.
   * PUT or PATCH syserrors/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a syserror with id.
   * DELETE syserrors/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = SysErrorController;

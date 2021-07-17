'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");
const { performance } = require("perf_hooks");
const SysLog = use("App/Models/SysLog");
const db = use("Database");


/**
 * Resourceful controller for interacting with syslogs
 */

class SysLogController {
  /**
   * Show a list of all syslogs.
   * GET syslogs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new syslog.
   * GET syslogs/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new syslog.
   * POST syslogs
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth }) {

    const { user_id, keterangan, src_data, action } = request.only([
      "user_id",
      "keterangan",
      "src_data",
      "action",
    ]);

    var t0 = performance.now();
    let durasi;

    try {
      await auth.authenticator("jwt").getUser();
    } catch (error) {
      console.log(error);
      durasi = await diagnoticTime.durasi(t0);
      response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: {},
      });
    }

    const trx = await db.beginTransaction();

    try {
      let sysLog = new SysLog();

      await sysLog.fill({
        user_id,
        keterangan,
        src_data,
        action,
      });

      await sysLog.save(trx);

      await trx.commit(trx);

      const result = await SysLog.query().last()

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
   * Display a single syslog.
   * GET syslogs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing syslog.
   * GET syslogs/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update syslog details.
   * PUT or PATCH syslogs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a syslog with id.
   * DELETE syslogs/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = SysLogController

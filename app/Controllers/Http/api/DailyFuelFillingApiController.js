"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const DailyRefueling = use("App/Models/DailyRefueling");
const db = use("Database");
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");
const moment = require("moment");

/**
 * Resourceful controller for interacting with dailyfuelfillings
 */
class DailyFuelFillingApiController {
  /**
   * Show a list of all dailyfuelfillings.
   * GET dailyfuelfillings
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {}

  /**
   * Render a form to be used for creating a new dailyfuelfilling.
   * GET dailyfuelfillings/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {}

  /**
   * Create/save a new dailyfuelfilling.
   * POST dailyfuelfillings
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, auth, params }) {}

  /**
   * Display a single dailyfuelfilling.
   * GET dailyfuelfillings/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Render a form to update an existing dailyfuelfilling.
   * GET dailyfuelfillings/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {}

  /**
   * Update dailyfuelfilling details.
   * PUT or PATCH dailyfuelfillings/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, auth }) {
    var t0 = performance.now();
    let durasi;
    const req = request.only([
      "timesheet_id",
      "topup",
      "smu",
      "equip_id",
      "operator",
      "fueling_at",
      "description",
      "fuelman",
    ]);

    const { id } = params;
    try {
      await auth.authenticator("jwt").getUser();
    } catch (error) {
      console.log(error);
      let durasi = await diagnoticTime.durasi(t0);
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      });
    };

    const trx = await db.beginTransaction();

    try {
      const dailyRefueling = await DailyRefueling.query(trx)
        .where("timesheet_id", id)
        .first();

      if (dailyRefueling) {
        dailyRefueling.merge({
          ...req,
          fueling_at: moment(req.fueling_at).format("YYYY-MM-DD HH:mm:ss"),
        });

        await dailyRefueling.save(trx);

        await trx.commit(trx);
        const result = await DailyRefueling.query()
          .where("timesheet_id", id)
          .first();

        durasi = await diagnoticTime.durasi(t0);
        response.status(201).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: result,
        });
      } else {
        trx.rollback(trx);
        durasi = await diagnoticTime.durasi(t0);
        response.status(201).json({
          diagnostic: {
            times: durasi,
            error: false,
            message: "Daily Refueling not found",
          },
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      await trx.rollback();
      durasi = await diagnoticTime.durasi(t0);
      response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      });
    }
  }

  /**
   * Delete a dailyfuelfilling with id.
   * DELETE dailyfuelfillings/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = DailyFuelFillingApiController;

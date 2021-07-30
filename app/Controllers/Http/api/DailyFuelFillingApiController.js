"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const DailyRefueling = use("App/Models/DailyRefueling");
const db = use("Database");
const { performance } = require("perf_hooks")
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");
const moment = require("moment");

/**
 * Resourceful controller for interacting with dailyfuelfillings
 */
class DailyFuelFillingApiController {
  async index({ request, response, view }) {}

  async create({ request, response, view }) {}

  async store({ request, response, auth }) {
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

    try {
      const dailyRefueling = new DailyRefueling()
      dailyRefueling.fill(req)
      await dailyRefueling.save()
      return response.status(201).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        data: dailyRefueling,
      });
    } catch (error) {
      console.log(error);
      return response.status(400).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      });
    }
  }

  async show({ params, request, response, view }) {}

  async edit({ params, request, response, view }) {}

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

  async destroy({ params, request, response }) {}
}

module.exports = DailyFuelFillingApiController;

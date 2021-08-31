"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const _request = require("request");
const { performance } = require("perf_hooks");
const moment = require("moment");
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");
const DailyChecklist = use("App/Models/DailyChecklist");
const db = use("Database");
const UserDevice = use("App/Models/UserDevice");

/**
 * Resourceful controller for interacting with notifications
 */
class NotificationController {
  /**
   * Show a list of all notifications.
   * GET notifications
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {}

  /**
   * Render a form to be used for creating a new notification.
   * GET notifications/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {}

  /**
   * Create/save a new notification.
   * POST notifications
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async morningShiftNotification({ request, response, auth }) {
    var t0 = performance.now();
    let durasi;

    try {
      await auth.authenticator("jwt").getUser();
    } catch (error) {
      console.log(error);
      durasi = await diagnoticTime.durasi(t0);
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: {},
      });
    }

    var sendMessage = function (device, message, data) {
      var restKey = "ZDJkYzBmZjAtZWIyOC00ODllLTk3MzUtMzgxZDU1OGUyMzE4";
      var appID = "dc5cda17-9d1b-41bd-9a14-3db91d8ccd11";
      _request(
        {
          method: "POST",
          uri: "https://onesignal.com/api/v1/notifications",
          headers: {
            authorization: "Basic " + restKey,
            "content-type": "application/json",
          },
          json: true,
          body: {
            app_id: appID,
            contents: { en: `\n ${message} !` },
            headings: { en : 'Penutupan HM Akhir'},
            include_player_ids: Array.isArray(device) ? device : [device],
            data: data,
          },
        },
        function (error, response, body) {
          if (!body.errors) {
            console.log(body);
          } else {
            console.error("Error:", body.errors);
          }
        }
      );
    };

    const timeNow = moment().format("YYYY-MM-DD");

    // morning shift
    const todayTimesheet = (
      await DailyChecklist.query()
        .with("userCheck", (wh) => {
          wh.with("deviceId");
          wh.with("profile");
        })
        .with("spv", (wh) => wh.with("profile"))
        .with("operator_unit")
        .with("equipment")
        .where((wh) => {
          wh.whereBetween("approved_at", [
            moment(`${timeNow} 07:01:00`).format("YYYY-MM-DD HH:mm:ss"),
            moment(`${timeNow} 07:01:00`)
              .add(12, "hour")
              .format("YYYY-MM-DD HH:mm:ss"),
          ]);
          wh.whereNull("end_smu");
        })
        .fetch()
    ).toJSON();

    for (let x of todayTimesheet) {
      let data = {
        type : 'time sheet',
        dailyfleet_id: x.dailyfleet_id,
        unit_id: x.unit_id,
        id: x.id,
        unit_name: x.equipment.kode,
      };
      const msg = `Jangan lupa untuk menutup HM akhir unit ${x.equipment.kode}`;
      sendMessage(x.userCheck.deviceId.playerId, msg, data);
    }

    durasi = await diagnoticTime.durasi(t0);
    return response.status(403).json({
      diagnostic: {
        times: durasi,
        error: false,
        message: "qq",
      },
      data: todayTimesheet,
    });
  }

  /**
   * Create/save a new notification.
   * POST notifications
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async nightShiftNotification({ request, response, auth }) {
    var t0 = performance.now();
    let durasi;

    try {
      await auth.authenticator("jwt").getUser();
    } catch (error) {
      console.log(error);
      durasi = await diagnoticTime.durasi(t0);
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: {},
      });
    }

    var sendMessage = function (device, message, data) {
      var restKey = "ZDJkYzBmZjAtZWIyOC00ODllLTk3MzUtMzgxZDU1OGUyMzE4";
      var appID = "dc5cda17-9d1b-41bd-9a14-3db91d8ccd11";
      _request(
        {
          method: "POST",
          uri: "https://onesignal.com/api/v1/notifications",
          headers: {
            authorization: "Basic " + restKey,
            "content-type": "application/json",
          },
          json: true,
          body: {
            app_id: appID,
            contents: { en: message },
            include_player_ids: Array.isArray(device) ? device : [device],
            data: data,
          },
        },
        function (error, response, body) {
          if (!body.errors) {
            console.log(body);
          } else {
            console.error("Error:", body.errors);
          }
        }
      );
    };

    const timeNow = moment().format("YYYY-MM-DD");

    // night shift
    const todayTimesheet = (
      await DailyChecklist.query()
        .whereBetween("approved_at", [
          `${timeNow} 19:01:00`,
          moment(`${timeNow} 07:00:00`)
            .add(12, "hour")
            .format("YYYY-MM-DD HH:mm:ss"),
        ])
        .fetch()
    ).toJSON();

    for (let x of todayTimesheet) {
      let data = {
        dailyfleet_id: x.dailyfleet_id,
        unit_id: x.unit_id,
        id: x.id,
      };

      const msg = `Jangan lupa untuk menutup time sheet unit ${x.id}`;
      sendMessage("308272c7-1f8c-4a12-bf30-d9366b4a06ca", msg, data);
    }
  }

  /**
   * Create/save a new notification.
   * POST notifications
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async storeUserDevice({ request, response, auth }) {
    var t0 = performance.now();
    let durasi;

    const { user_id, device_model, userId, playerId } = request.only([
      "user_id",
      "device_model",
      "userId",
      "playerId",
    ]);

    try {
      await auth.authenticator("jwt").getUser();
    } catch (error) {
      console.log(error);
      durasi = await diagnoticTime.durasi(t0);
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: {},
      });
    }

    const userDevice = new UserDevice();
    const checkIfExist = await UserDevice.query()
      .where("playerId", playerId)
      .first();

    if (checkIfExist) {
      try {
        checkIfExist.merge({
          user_id: user_id,
          userId: userId,
        });
        await checkIfExist.save();
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
            message: "Data is Existing, Replacing old user_id",
          },
          data: checkIfExist,
        });
      } catch (err) {
        durasi = await diagnoticTime.durasi(t0);
        return response.status(403).json({
          diagnostic: {
            times: durasi,
            error: true,
            message: err.message,
          },
          data: {},
        });
      }
    } else {
      try {
        userDevice.fill({
          userId,
          device_model,
          user_id,
          playerId,
        });
        await userDevice.save();
      } catch (err) {
        durasi = await diagnoticTime.durasi(t0);
        return response.status(403).json({
          diagnostic: {
            times: durasi,
            error: true,
            message: err.message,
          },
          data: {},
        });
      }
    }
  }

  /**
   * Display a single notification.
   * GET notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Render a form to update an existing notification.
   * GET notifications/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {}

  /**
   * Update notification details.
   * PUT or PATCH notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a notification with id.
   * DELETE notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = NotificationController;

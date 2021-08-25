"use strict";
const { performance } = require("perf_hooks");
const moment = require("moment");
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");
const db = use("Database");
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail");
const DailyRitase = use("App/Models/DailyRitase");

class DailyRitaseDetailApiController {
  async index({ request, response, auth }) {
    var t0 = performance.now();
    const req = request.all();
    const ranges = request.only(["begin_time", "end_time"]);
    const limit = 10;
    const page = req.page === undefined ? 1 : parseInt(req.page);
    const begin_time = ranges.begin_time
      ? new Date(ranges.begin_time)
      : new Date(moment().startOf("year").format("YYYY-MM-DD HH:mm"));
    const end_time = ranges.end_time ? new Date(ranges.end_time) : new Date();

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

    if (ranges.end_time) {
      await GET_BY_RANGE();
    } else {
      await GET_ALL();
    }

    async function GET_ALL() {
      try {
        let dailyRitaseDetail = await DailyRitaseDetail.query()
          .with("daily_ritase")
          .with("checker")
          .with("spv")
          .with("hauler")
          .where(req)
          .paginate(page, limit);
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitaseDetail,
        });
      } catch (error) {
        console.log(error);
        durasi = await diagnoticTime.durasi(t0);
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

    async function GET_BY_RANGE() {
      try {
        let dailyRitaseDetail = await DailyRitaseDetail.query()
          .with("daily_ritase")
          .with("checker")
          .with("spv")
          .with("hauler")
          .where("check_in", ">=", begin_time)
          .andWhere("check_in", "<=", end_time)
          .paginate(page, limit);
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitaseDetail,
        });
      } catch (error) {
        console.log(error);
        durasi = await diagnoticTime.durasi(t0);
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
  }

  async create({ request, response, auth }) {
    var t0 = performance.now();
    const req = request.only([
      "dailyritase_id",
      "checker_id",
      "spv_id",
      "hauler_id",
      "tipe",
      "distance",
    ]);
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
        data: [],
      });
    }

    if (req.tipe !== "normal" && req.tipe !== 'in pit') {
      await SAVE_DATA_WITH_NEW_DAILY_RITASE();
    } else {
      await SAVE_DATA();
    }

    async function SAVE_DATA_WITH_NEW_DAILY_RITASE() {
      const dailyRitase = new DailyRitase();
      const existingDailyRitase = await DailyRitase.query()
        .where("id", req.dailyritase_id)
        .first();

      dailyRitase.fill({
        dailyfleet_id: existingDailyRitase.dailyfleet_id,
        material: existingDailyRitase.material,
        distance: req.distance,
        date: existingDailyRitase.date,
        exca_id: existingDailyRitase.exca_id,
      });

      await dailyRitase.save();
      try {
        const dailyRitaseDetail = new DailyRitaseDetail();
        dailyRitaseDetail.fill({
          dailyritase_id: dailyRitase.id,
          checker_id: req.checker_id,
          spv_id: req.spv_id,
          hauler_id: req.hauler_id,
          check_in: new Date(),
        });

        await dailyRitaseDetail.save();

        const _dailyRitase = await DailyRitase.findOrFail(dailyRitase.id);
        const totalRitase = await DailyRitaseDetail.query()
          .where("dailyritase_id", _dailyRitase.id)
          .getCount();
        _dailyRitase.merge({ tot_ritase: totalRitase });
        await _dailyRitase.save();

        durasi = await diagnoticTime.durasi(t0);
        return response.status(201).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitaseDetail,
        });
      } catch (error) {
        console.log(error);
        durasi = await diagnoticTime.durasi(t0);
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
    async function SAVE_DATA() {
      const dailyRitaseDetail = new DailyRitaseDetail();
      dailyRitaseDetail.fill({
        dailyritase_id: req.dailyritase_id,
        checker_id: req.checker_id,
        spv_id: req.spv_id,
        hauler_id: req.hauler_id,
        check_in: new Date(),
      });
      try {
        await dailyRitaseDetail.save();
        durasi = await diagnoticTime.durasi(t0);
        return response.status(201).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitaseDetail,
        });
      } catch (error) {
        console.log(error);
        durasi = await diagnoticTime.durasi(t0);
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
  }

  async show({ params, response, auth }) {
    const { id } = params;
    var t0 = performance.now();
    let durasi;
    response.status(200).json({ data: "ok" });
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
        data: [],
      });
    }
    await GET_BY_ID();

    async function GET_BY_ID() {
      try {
        const dailyRitaseDetail = await DailyRitaseDetail.query()
          .with("daily_ritase")
          .with("checker")
          .with("spv")
          .with("hauler")
          .where("id", id)
          .first();
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitaseDetail,
        });
      } catch (error) {
        console.log(error);
        durasi = await diagnoticTime.durasi(t0);
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
  }

  async getByRitID({ params, response, auth }) {
    const { id } = params;
    var t0 = performance.now();
    let durasi;
    response.status(200).json({ data: "ok" });
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
        data: [],
      });
    }
    await GET_BY_ID();

    async function GET_BY_ID() {
      try {
        const dailyRitaseDetail = await DailyRitaseDetail.query()
          .with("daily_ritase")
          .with("checker", (w) => w.with("profile"))
          .with("spv", (w) => w.with("profile"))
          .with("hauler")
          .where("dailyritase_id", id)
          .orderBy([{ column: "created_at", order: "desc" }])
          .fetch();
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitaseDetail,
        });
      } catch (error) {
        console.log(error);
        durasi = await diagnoticTime.durasi(t0);
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
  }

  async update({ auth, params, request, response }) {
    var t0 = performance.now();
    const { id } = params;
    const req = request.only([
      "dailyritase_id",
      "checker_id",
      "spv_id",
      "hauler_id",
      "check_in",
    ]);

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
        data: [],
      });
    }

    await UPDATE_DATA_BY_ID();

    async function UPDATE_DATA_BY_ID() {
      req.check_in = req.check_in ? new Date(req.check_in) : new Date();
      try {
        const dailyRitaseDetail = await DailyRitaseDetail.findOrFail(id);
        dailyRitaseDetail.merge(req);
        await dailyRitaseDetail.save();
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitaseDetail,
        });
      } catch (error) {
        console.log(error);
        durasi = await diagnoticTime.durasi(t0);
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
  }

  async destroy({ auth, params, request, response }) {
    var t0 = performance.now();
    const { id } = params;
    const req = request.only([
      "dailyritase_id",
      "checker_id",
      "spv_id",
      "hauler_id",
      "check_in",
    ]);

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
        data: [],
      });
    }

    await DESTROY_DATA_BY_ID();

    async function DESTROY_DATA_BY_ID() {
      try {
        const dailyRitaseDetail = await DailyRitaseDetail.findOrFail(id);
        await dailyRitaseDetail.delete();
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitaseDetail,
        });
      } catch (error) {
        console.log(error);
        durasi = await diagnoticTime.durasi(t0);
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
  }
}

module.exports = DailyRitaseDetailApiController;

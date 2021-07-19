"use strict";

const moment = require("moment");
const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan");
const DailyPlans = use("App/Models/DailyPlan");
const { performance } = require("perf_hooks");
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");
const DailyRefueling = use("App/Models/DailyRefueling");
const _ = require("underscore");

class MonthlyPlanApiController {
  async index({ request, response, view }) {}

  async create({ request, response, view }) {
    const req = request.all();
    try {
      const data = await MonthlyPlanHelpers.POST(req);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async show({ params, request, response, view }) {}

  async edit({ params, request, response, view }) {}

  async update({ params, request, response }) {}

  async destroy({ params, request, response }) {}

  async getWeeklyOBProduction({ request, response, auth }) {
    const { date } = request.only(["date"]);
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

    const currentWeekDays = Array.from({ length: 7 }, (x, i) =>
      moment().startOf("week").add(i, "days").format("ddd")
    );

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD");
    const EoW = moment(date).endOf("week").format("YYYY-MM-DD");

    try {
      let dailyPlans;

      dailyPlans = (
        await DailyPlans.query()
          .with("monthly_plan")
          .where("current_date", ">=", SoW)
          .andWhere("current_date", "<=", EoW)
          .andWhere("tipe", "OB")
          .fetch()
      ).toJSON();

      const data = {
        monthly_plan: dailyPlans,
        labels: currentWeekDays,
        actual: dailyPlans.map((item) => parseFloat(item.actual)),
      };

      data.monthly_plan.month = moment().format("MMMM YYYY");

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        data: data,
      });
    } catch (error) {
      console.log(error);
      durasi = await diagnoticTime.durasi(t0);
      return response.status(404).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error,
        },
        data: {
          monthly_plan: {
            month: moment().format("MMMM YYYY"),
            satuan: "BCM",
            estimate: 0,
            actual: 0,
          },
          labels: currentWeekDays,
          actual: [],
        },
      });
    }
  }

  async getWeeklyCoalProduction({ request, response, auth }) {
    const { date } = request.only(["date"]);
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

    const currentWeekDays = Array.from({ length: 7 }, (x, i) =>
      moment().startOf("week").add(i, "days").format("ddd")
    );

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD");
    const EoW = moment(date).endOf("week").format("YYYY-MM-DD");

    try {
      let dailyPlans;

      dailyPlans = (
        await DailyPlans.query()
          .with("monthly_plan")
          .where("current_date", ">=", SoW)
          .andWhere("current_date", "<=", EoW)
          .andWhere("tipe", "COAL")
          .fetch()
      ).toJSON();

      const data = {
        monthly_plan: dailyPlans,
        labels: currentWeekDays,
        actual: dailyPlans.map((item) => parseFloat(item.actual)),
      };

      data.monthly_plan.month = moment().format("MMMM YYYY");

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        data: data,
      });
    } catch (error) {
      console.log(error);
      durasi = await diagnoticTime.durasi(t0);
      return response.status(404).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error,
        },
        data: {
          monthly_plan: {
            month: moment().format("MMMM YYYY"),
            satuan: "MT",
            estimate: 0,
            actual: 0,
          },
          labels: currentWeekDays,
          actual: [],
        },
      });
    }
  }

  async getWeeklyFuelConsumption({ auth, request, response }) {
    const { date } = request.only(["date"]);

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

    let dataPeriode = [];

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD");
    const EoW = moment(date).endOf("week").format("YYYY-MM-DD");

    const currentWeekDays = Array.from({ length: 7 }, (x, i) =>
      moment().startOf("week").add(i, "days").format("ddd")
    );

    dataPeriode = (
      await DailyRefueling.query()
        .whereBetween("fueling_at", [SoW, EoW])
        .fetch()
    ).toJSON();

    dataPeriode = dataPeriode.map((item) => {
      return { ...item, fueling_at: moment(item.fueling_at).format("ddd") };
    });

    var result = [];
    dataPeriode.reduce(function (res, value) {
      if (!res[value.fueling_at]) {
        res[value.fueling_at] = { fueling_at: value.fueling_at, topup: 0 };
        result.push(res[value.fueling_at]);
      }
      res[value.fueling_at].topup += value.topup;
      return res;
    }, {});

    let t = [];
    let temp = [];

    for (let i = 0; i < result.length; i++) {
      if (result[i].fueling_at === currentWeekDays[i]) {
        let obj = {
          fueling_at: result[i].fueling_at,
          topup: result[i].topup,
        };
        t.push(obj);
      } else {
        for (let x = 0; x < currentWeekDays.length; x++) {
          if (result[i].fueling_at !== currentWeekDays[x]) {
            let obj = {
              fueling_at: currentWeekDays[x],
              topup: 0,
            };
            temp.push(obj);
          } else {
            let obj = {
              fueling_at: result[i].fueling_at,
              topup: result[i].topup,
            };
            t.push(obj);
          }
        }
      }
    }

    const newArr = [
      ...new Map(temp.map((item) => [item["fueling_at"], item])).values(),
    ];

    const weeklyFuel = newArr.map(
      (obj) => t.find((o) => o.fueling_at === obj.fueling_at) || obj
    );

    let r = [];
    for (let i = 0; i < weeklyFuel.length; i++) {
      if (weeklyFuel[i].fueling_at === "Sun") {
        r[0] = weeklyFuel[i];
      }
      if (weeklyFuel[i].fueling_at === "Mon") {
        r[1] = weeklyFuel[i];
      }
      if (weeklyFuel[i].fueling_at === "Tue") {
        r[2] = weeklyFuel[i];
      }
      if (weeklyFuel[i].fueling_at === "Wed") {
        r[3] = weeklyFuel[i];
      }
      if (weeklyFuel[i].fueling_at === "Thu") {
        r[4] = weeklyFuel[i];
      }
      if (weeklyFuel[i].fueling_at === "Fri") {
        r[5] = weeklyFuel[i];
      }
      if (weeklyFuel[i].fueling_at === "Sat") {
        r[6] = weeklyFuel[i];
      }
    }

    return {
      dayLabels: _.pluck(r, "fueling_at"),
      fuelConsumptionDaily: _.pluck(r, "topup"),
    };
  }
}

module.exports = MonthlyPlanApiController;

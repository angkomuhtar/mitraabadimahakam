"use strict";

const moment = require("moment");
const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan");
const DailyPlans = use("App/Models/DailyPlan");
const { performance } = require("perf_hooks");
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");
const DailyRefueling = use("App/Models/DailyRefueling");
const _ = require("underscore");
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail");
const DailyRitaseCoalDetail = use("App/Models/DailyRitaseCoalDetail");
const db = use("Database");
const DailyEvent = use("App/Models/DailyEvent");
const { infinityCheck } = use("App/Controllers/Http/customClass/utils");

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

      let temp = [];
      let _temp = [];

      for (let x of dailyPlans) {
        let obj = {
          current_date: moment(x.current_date).format("ddd"),
          actual: x.actual,
        };
        temp.push(obj);
      }

      for (let i = 0; i < currentWeekDays.length; i++) {
        let obj = {
          current_date: currentWeekDays[i],
          actual: 0,
        };
        _temp.push(obj);
      }

      let a = [...temp, ..._temp];

      const newArr = [
        ...new Map(a.map((item) => [item["current_date"], item])).values(),
      ];

      const weeklyOB = newArr.map(
        (obj) => temp.find((o) => o.current_date === obj.current_date) || obj
      );

      let r = [];
      for (let i = 0; i < weeklyOB.length; i++) {
        if (weeklyOB[i].current_date === "Sun") {
          r[0] = weeklyOB[i];
        }
        if (weeklyOB[i].current_date === "Mon") {
          r[1] = weeklyOB[i];
        }
        if (weeklyOB[i].current_date === "Tue") {
          r[2] = weeklyOB[i];
        }
        if (weeklyOB[i].current_date === "Wed") {
          r[3] = weeklyOB[i];
        }
        if (weeklyOB[i].current_date === "Thu") {
          r[4] = weeklyOB[i];
        }
        if (weeklyOB[i].current_date === "Fri") {
          r[5] = weeklyOB[i];
        }
        if (weeklyOB[i].current_date === "Sat") {
          r[6] = weeklyOB[i];
        }
      }

      let data = {
        labels: _.pluck(r, "current_date"),
        actual: _.pluck(r, "actual"),
      };

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
        data: {},
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

      let temp = [];
      let _temp = [];

      for (let x of dailyPlans) {
        let obj = {
          current_date: moment(x.current_date).format("ddd"),
          actual: x.actual,
        };
        temp.push(obj);
      }

      for (let i = 0; i < currentWeekDays.length; i++) {
        let obj = {
          current_date: currentWeekDays[i],
          actual: 0,
        };
        _temp.push(obj);
      }

      let a = [...temp, ..._temp];

      const newArr = [
        ...new Map(a.map((item) => [item["current_date"], item])).values(),
      ];

      const weeklyCoal = newArr.map(
        (obj) => temp.find((o) => o.current_date === obj.current_date) || obj
      );

      let r = [];
      for (let i = 0; i < weeklyCoal.length; i++) {
        if (weeklyCoal[i].current_date === "Sun") {
          r[0] = weeklyCoal[i];
        }
        if (weeklyCoal[i].current_date === "Mon") {
          r[1] = weeklyCoal[i];
        }
        if (weeklyCoal[i].current_date === "Tue") {
          r[2] = weeklyCoal[i];
        }
        if (weeklyCoal[i].current_date === "Wed") {
          r[3] = weeklyCoal[i];
        }
        if (weeklyCoal[i].current_date === "Thu") {
          r[4] = weeklyCoal[i];
        }
        if (weeklyCoal[i].current_date === "Fri") {
          r[5] = weeklyCoal[i];
        }
        if (weeklyCoal[i].current_date === "Sat") {
          r[6] = weeklyCoal[i];
        }
      }

      let data = {
        labels: _.pluck(r, "current_date"),
        actual: _.pluck(r, "actual"),
      };

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
        data: {},
      });
    }
  }

  async getWeeklyFuelConsumption({ auth, request, response }) {
    const { date } = request.only(["date"]);

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD");
    const EoW = moment(date).endOf("week").format("YYYY-MM-DD");

    const currentWeekDays = Array.from({ length: 7 }, (x, i) =>
      moment().startOf("week").add(i, "days").format("ddd")
    );

    let durasi;
    var t0 = performance.now();

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

    try {
      let dataPeriode = [];

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

      let _temp = [];

      for (let i = 0; i < currentWeekDays.length; i++) {
        let obj = {
          fueling_at: currentWeekDays[i],
          topup: 0,
        };
        _temp.push(obj);
      }

      let temp = [..._temp, ...result];

      const weeklyFuel = [
        ...new Map(temp.map((item) => [item["fueling_at"], item])).values(),
      ];

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

      let data = {
        labels: _.pluck(r, "fueling_at"),
        actual: _.pluck(r, "topup"),
      };

      if (!data.labels && !data.actual) {
        data = {
          labels: currentWeekDays,
          actual: [0, 0, 0, 0, 0, 0, 0],
        };
      }

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
        data: {},
      });
    }
  }

  async getMonthlyRecap({ auth, request, response }) {
    const { date } = request.only(["date"]);
    let durasi;
    var t0 = performance.now();

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

    try {
      const SoY = moment(date).startOf("year").format("YYYY-MM-DD");
      const EoY = moment(date).endOf("year").format("YYYY-MM-DD");

      const allMonthsThisYear = Array.apply(0, Array(12)).map(function (_, i) {
        return moment(date).month(i).format("MMMM");
      });

      let monthArr = [];
      for (let x of allMonthsThisYear) {
        const obj = {
          month_name: x,
          value: {
            ob: 0,
            coal: 0,
            fuel: 0,
          },
        };
        monthArr.push(obj);
      }

      const fuels = (
        await DailyRefueling.query()
          .whereBetween("fueling_at", [SoY, EoY])
          .fetch()
      ).toJSON();

      const coals = (
        await DailyPlans.query()
          .whereBetween("current_date", [SoY, EoY])
          .andWhere("tipe", "COAL")
          .fetch()
      ).toJSON();

      const obs = (
        await DailyPlans.query()
          .whereBetween("current_date", [SoY, EoY])
          .andWhere("tipe", "OB")
          .fetch()
      ).toJSON();

      const convertFuelsToMonthName = fuels.map((v) => {
        return {
          month_name: moment(v.fueling_at).format("MMMM"),
          value: v.topup,
        };
      });

      const convertCoalsToMonthName = coals.map((v) => {
        return {
          month_name: moment(v.current_date).format("MMMM"),
          value: v.actual,
        };
      });

      const convertObsToMonthName = obs.map((v) => {
        return {
          month_name: moment(v.current_date).format("MMMM"),
          value: v.actual,
        };
      });

      let newArr = [];
      for (let z of monthArr) {
        let obj = {
          month_name: z.month_name,
          value: {
            ob: convertObsToMonthName
              .filter((x) => x.month_name === z.month_name)
              .reduce((a, b) => a + b.value, 0),
            coal: convertCoalsToMonthName
              .filter((x) => x.month_name === z.month_name)
              .reduce((a, b) => a + b.value, 0),
            fuel: convertFuelsToMonthName
              .filter((x) => x.month_name === z.month_name)
              .reduce((a, b) => a + b.value, 0),
          },
        };
        newArr.push(obj);
      }

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        data: newArr,
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
        data: {},
      });
    }
  }

  async getDailyReport({ auth, request, response }) {
    const { date } = request.only(["date"]);
    let durasi;
    var t0 = performance.now();

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

    try {
      const today = moment(date).format("YYYY-MM-DD");
      const prevDay = moment(date).subtract(1, "days").format("YYYY-MM-DD");

      const ds = `${prevDay} 06:01:00`;
      const ns_1 = `${prevDay} 18:01:00`;
      const ns_2 = `${today} 00:00:00`;
      const ns_3 = `${today} 06:00:00`;

      const trx = await db.beginTransaction();

      // OB Ritase
      const ritaseOBDS = (
        await DailyRitaseDetail.query(trx)
          .with("daily_ritase", (wh) => {
            wh.with("material_details");
          })
          .whereBetween("check_in", [ds, ns_1])
          .fetch()
      ).toJSON();
      const ritaseOBNS_1 = (
        await DailyRitaseDetail.query(trx)
          .with("daily_ritase", (wh) => {
            wh.with("material_details");
          })
          .whereBetween("check_in", [ns_1, ns_2])
          .fetch()
      ).toJSON();
      const ritaseOBNS_2 = (
        await DailyRitaseDetail.query(trx)
          .with("daily_ritase", (wh) => {
            wh.with("material_details");
          })
          .whereBetween("check_in", [ns_2, ns_3])
          .fetch()
      ).toJSON();

      // Coal Ritase
      const ritaseCoalDS = (
        await DailyRitaseCoalDetail.query(trx)
          .whereBetween("checkout_jt", [ds, ns_1])
          .fetch()
      ).toJSON();
      const ritaseCoalNS_1 = (
        await DailyRitaseCoalDetail.query(trx)
          .whereBetween("checkout_jt", [ns_1, ns_2])
          .fetch()
      ).toJSON();
      const ritaseCoalNS_2 = (
        await DailyRitaseCoalDetail.query(trx)
          .whereBetween("checkout_jt", [ns_2, ns_3])
          .fetch()
      ).toJSON();

      // Daily Plans, Breakdown from Monthly Plans / Number of Days in month
      const coalPlanToday = (
        await DailyPlans.query(trx)
          .where("current_date", prevDay)
          .andWhere("tipe", "COAL")
          .first()
      ).toJSON();
      const obPlanToday = (
        await DailyPlans.query(trx)
          .where("current_date", prevDay)
          .andWhere("tipe", "OB")
          .first()
      ).toJSON();

      const OB_NS_1_ACCUMULATE = ritaseOBNS_1.reduce(
        (a, b) => a + b.daily_ritase.material_details.vol,
        0
      );
      const OB_NS_2_ACCUMULATE = ritaseOBNS_2.reduce(
        (a, b) => a + b.daily_ritase.material_details.vol,
        0
      );
      const obActualDS = parseInt(
        ritaseOBDS.reduce((a, b) => a + b.daily_ritase.material_details.vol, 0)
      );
      const obActualNS = parseInt(OB_NS_1_ACCUMULATE + OB_NS_2_ACCUMULATE);
      const obActualToday = parseInt(obActualDS + obActualNS);
      const obAchieved = parseFloat(
        ((obActualToday / obPlanToday.estimate) * 100).toFixed(2)
      );

      const coalActualDS = parseInt(
        ritaseCoalDS.reduce((a, b) => a + b.w_netto, 0)
      );
      const coalActualNS =
        parseInt(ritaseCoalNS_1.reduce((a, b) => a + b.w_netto, 0)) +
        parseInt(ritaseCoalNS_2.reduce((a, b) => a + b.w_netto, 0));
      const coalActualToday = parseInt(coalActualDS + coalActualNS);
      const coalAchieved = parseFloat(
        ((coalActualToday / coalPlanToday.estimate) * 100).toFixed(2)
      );

      const SoM = moment(date).startOf("month").format("YYYY-MM-DD");
      const now = moment(date).format("YYYY-MM-DD");

      const mtd_ob_actual = (
        await DailyPlans.query(trx)
          .whereBetween("current_date", [SoM, now])
          .where("tipe", "OB")
          .fetch()
      ).toJSON();
      const mtd_coal_actual = (
        await DailyPlans.query(trx)
          .whereBetween("current_date", [SoM, now])
          .where("tipe", "COAL")
          .fetch()
      ).toJSON();

      const _MTD_COAL_ACTUAL_BY_TC = parseInt(
        mtd_coal_actual.reduce((a, b) => a + b.actual, 0)
      );
      const _MTD_OB_ACTUAL_BY_TC = parseInt(
        mtd_ob_actual.reduce((a, b) => a + b.actual, 0)
      );
      let MTD_COAL_SR = parseFloat(
        (_MTD_OB_ACTUAL_BY_TC / _MTD_COAL_ACTUAL_BY_TC).toFixed(2)
      );

      if (await infinityCheck(MTD_COAL_SR)) {
        MTD_COAL_SR = 0;
      }

      const COAL_EXPOSE = "28.500";
      const MTD_COAL_EXPOSE = "49.900,94";
      let MTD_COAL_EXPOSE_SR = parseFloat(
        (
          _MTD_OB_ACTUAL_BY_TC /
          (_MTD_COAL_ACTUAL_BY_TC + parseInt(COAL_EXPOSE))
        ).toFixed(2)
      );

      if (await infinityCheck(MTD_COAL_EXPOSE_SR)) {
        MTD_COAL_EXPOSE_SR = 0;
      }

      const DAILY_EVENT_DS = (
        await DailyEvent.query(trx)
          .with("event")
          .where("start_at", ">=", [ds])
          .andWhere("end_at", "<=", [ns_1])
          .orderBy("start_at", "asc")
          .fetch()
      ).toJSON();
      const DAILY_EVENT_NS_1 = (
        await DailyEvent.query(trx)
          .with("event")
          .where("start_at", ">=", [ns_1])
          .andWhere("end_at", "<=", [ns_2])
          .orderBy("start_at", "asc")
          .fetch()
      ).toJSON();
      const DAILY_EVENT_NS_2 = (
        await DailyEvent.query(trx)
          .with("event")
          .where("start_at", ">=", [ns_2])
          .andWhere("end_at", "<=", [ns_3])
          .orderBy("start_at", "asc")
          .fetch()
      ).toJSON();

      let EVENT_DS = [];
      let EVENT_NS_1 = [];
      let EVENT_NS_2 = [];

      try {
        if (DAILY_EVENT_DS) {
          for (let e of DAILY_EVENT_DS) {
            let obj = {
              event_name: e.event.narasi,
              range_time: `${
                moment(e.start_at).format("LT")
              } - ${moment(e.end_at).format('LT')}`,
            };
            EVENT_DS.push(obj);
          }
        }

        if (DAILY_EVENT_NS_1) {
          for (let e of DAILY_EVENT_NS_1) {
            let obj = {
              event_name: e.event.narasi,
              range_time: `${
                moment(e.start_at).format("LT")
              } - ${moment(e.end_at).format("LT")}`,
            };
            EVENT_NS_1.push(obj);
          }
        }
        if (EVENT_NS_2) {
          for (let e of DAILY_EVENT_NS_2) {
            let obj = {
              event_name: e.event.narasi,
              range_time: `${
                moment(e.start_at).format("LT")
              } - ${moment(e.end_at).format("LT")}`,
            };
            EVENT_NS_2.push(obj);
          }
        }
      } catch (err) {
        console.log(err);
      }

      let EVENT_NS = [...EVENT_NS_1, ...EVENT_NS_2];

      let data = {
        daily_ob: {
          ds: obActualDS,
          ns: obActualNS,
          actual: obActualToday,
          plan: obPlanToday.estimate,
          achieved: obAchieved,
          ritase_total : ritaseOBDS.length || 0
        },
        daily_coal: {
          ds: coalActualDS,
          ns: coalActualNS,
          actual: coalActualToday,
          plan: coalPlanToday.estimate,
          achieved: coalAchieved,
          ritase_total : ritaseOBNS_1.length + ritaseOBNS_2.length
        },
        mtd_ob_actual_by_tc: _MTD_OB_ACTUAL_BY_TC,
        mtd_coal_actual_by_tc: _MTD_COAL_ACTUAL_BY_TC,
        mtd_coal_actual_by_tc_sr: MTD_COAL_SR,
        coal_expose: COAL_EXPOSE,
        mtd_coal_expose: MTD_COAL_EXPOSE,
        mtd_coal_expose_sr: MTD_COAL_EXPOSE_SR,
        event: {
          ds: EVENT_DS,
          ns: EVENT_NS,
        },
      };

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
          request_time: date,
          server_time: moment(date).format("YYYY-MM-DD"),
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
        data: {},
      });
    }
  }
}

module.exports = MonthlyPlanApiController;

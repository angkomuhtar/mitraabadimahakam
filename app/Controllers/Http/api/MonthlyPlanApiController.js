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
const MasShift = use("App/Models/MasShift");
const MonthlyPlans = use("App/Models/MonthlyPlan");
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
    const { date, pit_id } = request.only(["date", "pit_id"]);
    var t0 = performance.now();
    let durasi;

    const _pit_id = pit_id ? pit_id : 1;

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

    const SoM = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");

    const monthlyPlans = await MonthlyPlans.query()
      .with("pit")
      .where("month", SoM)
      .andWhere("pit_id", _pit_id)
      .first();

    const MONTHLYPLANS_ID = monthlyPlans?.id;

    const currentWeekDays = Array.from({ length: 7 }, (x, i) =>
      moment().startOf("week").add(i, "days").format("ddd")
    );

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD");
    const EoW = moment(date).endOf("week").format("YYYY-MM-DD");

    let dailyPlans;
    try {
      dailyPlans = (
        await DailyPlans.query()
          .with("monthly_plan")
          .where("current_date", ">=", SoW)
          .andWhere("current_date", "<=", EoW)
          .andWhere("tipe", "OB")
          .andWhere("monthlyplans_id", MONTHLYPLANS_ID)
          .fetch()
      ).toJSON();

      console.log("daily plans found ?? ", dailyPlans);

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

      const WEEKLY_OB_ACTUAL = parseFloat(
        r.reduce((a, b) => a + b.actual, 0).toFixed(2)
      );
      const WEEKLY_OB_PLAN = parseFloat(
        dailyPlans.reduce((a, b) => a + b.estimate, 0).toFixed(2)
      );

      let data = {
        labels: _.pluck(r, "current_date"),
        actual: _.pluck(r, "actual"),
        plan: {
          actual: WEEKLY_OB_ACTUAL,
          weeklyPlan: WEEKLY_OB_PLAN,
          ach:
            parseFloat(
              ((WEEKLY_OB_ACTUAL / WEEKLY_OB_PLAN) * 100).toFixed(2)
            ) || 0,
        },
      };

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        pit_name: monthlyPlans.toJSON().pit.name,
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
    const { date, pit_id } = request.only(["date", "pit_id"]);
    var t0 = performance.now();
    let durasi;

    const _pit_id = pit_id ? pit_id : 1;

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

    const SoM = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");

    const monthlyPlans = await MonthlyPlans.query()
      .with("pit")
      .where("month", SoM)
      .andWhere("pit_id", _pit_id)
      .first();

    const MONTHLYPLANS_ID = monthlyPlans?.id;

    const currentWeekDays = Array.from({ length: 7 }, (x, i) =>
      moment().startOf("week").add(i, "days").format("ddd")
    );

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD");
    const EoW = moment(date).endOf("week").format("YYYY-MM-DD");

    let dailyPlans;

    try {
      dailyPlans = (
        await DailyPlans.query()
          .with("monthly_plan")
          .where("current_date", ">=", SoW)
          .andWhere("current_date", "<=", EoW)
          .andWhere("tipe", "COAL")
          .andWhere("monthlyplans_id", MONTHLYPLANS_ID)
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

      const WEEKLY_COAL_ACTUAL = parseFloat(
        r.reduce((a, b) => a + b.actual, 0).toFixed(2)
      );
      const WEEKLY_COAL_PLAN = parseFloat(
        dailyPlans.reduce((a, b) => a + b.estimate, 0).toFixed(2)
      );

      let data = {
        labels: _.pluck(r, "current_date"),
        actual: _.pluck(r, "actual"),
        plan: {
          actual: WEEKLY_COAL_ACTUAL,
          weeklyPlan: WEEKLY_COAL_PLAN,
          ach:
            parseFloat(
              ((WEEKLY_COAL_ACTUAL / WEEKLY_COAL_PLAN) * 100).toFixed(2)
            ) || 0,
        },
      };

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        pit_name: monthlyPlans.toJSON().pit.name,
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

    let dataPeriode = [];

    try {
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
    const { date, page, limit, filter_month } = request.only([
      "date",
      "page",
      "limit",
      "filter_month",
    ]);
    let durasi;
    var t0 = performance.now();

    const _page = parseInt(page) || 1;
    const _limit = parseInt(limit) || 2;
    const startIndex = _page - 1;
    const endIndex = _page * _limit;

    const paginate = {};
    const filter = filter_month;

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
      const SoY = moment(date).startOf("year").format("YYYY-MM-DD HH:mm:ss");
      const EoY = moment(date).endOf("year").format("YYYY-MM-DD HH:mm:ss");

      const allMonthsThisYear = Array.apply(0, Array(12)).map(function (_, i) {
        return moment(date).month(i).format("MMMM");
      });

      const CURRENT_MONTH = moment(date)
        .startOf("month")
        .format("YYYY-MM-DD HH:mm:ss");

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

      const MONTHLY_OB_PLANS = (
        await MonthlyPlans.query()
          .whereBetween("month", [SoY, EoY])
          .andWhere("tipe", "OB")
          .fetch()
      ).toJSON();
      const MONTHLY_COAL_PLANS = (
        await MonthlyPlans.query()
          .whereBetween("month", [SoY, EoY])
          .andWhere("tipe", "BB")
          .fetch()
      ).toJSON();

      let convertFuelsToMonthName = fuels.map((v) => {
        return {
          month_name: moment(v.fueling_at).format("MMMM"),
          value: v.topup,
        };
      });

      let convertCoalsToMonthName = coals.map((v) => {
        return {
          month_name: moment(v.current_date).format("MMMM"),
          value: v.actual,
          plans:
            MONTHLY_COAL_PLANS.filter(
              (x) =>
                moment(x.month).format("YYYY-MM-DD") ===
                moment(v.current_date).format("YYYY-MM-DD")
            )[0]?.estimate || 0,
          ach: 0,
        };
      });

      let convertObsToMonthName = obs.map((v) => {
        return {
          month_name: moment(v.current_date).format("MMMM"),
          value: v.actual,
          plans:
            MONTHLY_OB_PLANS.filter(
              (x) =>
                moment(x.month).format("YYYY-MM-DD") ===
                moment(v.current_date).format("YYYY-MM-DD")
            )[0]?.estimate || 0,
          ach: 0,
        };
      });

      let newArr = [];
      for (let z of monthArr) {
        let obj = {
          month_name: z.month_name,
          value: {
            ob: {
              value: convertObsToMonthName
                .filter((x) => x.month_name === z.month_name)
                .reduce((a, b) => a + b.value, 0),
              plans:
                convertObsToMonthName.filter(
                  (v) => v.month_name === z.month_name
                )[0]?.plans || 0,
              ach:
                parseFloat(
                  (
                    (convertObsToMonthName
                      .filter((x) => x.month_name === z.month_name)
                      .reduce((a, b) => a + b.value, 0) /
                      convertObsToMonthName.filter(
                        (v) => v.month_name === z.month_name
                      )[0]?.plans) *
                    100
                  ).toFixed(2)
                ) || 0,
            },
            coal: {
              value: convertCoalsToMonthName
                .filter((x) => x.month_name === z.month_name)
                .reduce((a, b) => a + b.value, 0),
              plans:
                convertCoalsToMonthName.filter(
                  (v) => v.month_name === z.month_name
                )[0]?.plans || 0,
              ach:
                parseFloat(
                  (
                    (convertCoalsToMonthName
                      .filter((x) => x.month_name === z.month_name)
                      .reduce((a, b) => a + b.value, 0) /
                      convertCoalsToMonthName.filter(
                        (v) => v.month_name === z.month_name
                      )[0]?.plans) *
                    100
                  ).toFixed(2)
                ) || 0,
            },
            fuel: convertFuelsToMonthName
              .filter((x) => x.month_name === z.month_name)
              .reduce((a, b) => a + b.value, 0),
          },
        };
        newArr.push(obj);
      }

      const CURRENT_MONTH_RECAP = newArr.filter(
        (v) => v.month_name === moment(date).format("MMMM")
      )[0];

      if (endIndex < newArr.length) {
        paginate.next = {
          page: _page + 1,
          limit: _limit,
        };
      }

      if (startIndex > 0) {
        paginate.previous = {
          page: _page - 1,
          limit: _limit,
        };
      }

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        ...paginate,
        diagnostic: {
          times: durasi,
          error: false,
        },
        data: filter_month
          ? newArr.filter((v) => v.month_name === filter)
          : [
              ...newArr
                .slice(0, endIndex)
                .filter((v) => v.month_name !== moment(date).format("MMMM")),
              CURRENT_MONTH_RECAP,
            ],
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

    const trx = await db.beginTransaction();

    try {
      const today = moment(date).format("YYYY-MM-DD");
      const prevDay = moment(date).subtract(1, "days").format("YYYY-MM-DD");

      const shifts = (await MasShift.query().fetch()).toJSON();

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

      let RIT_OB_ARR = [];
      let RIT_COAL_ARR = [];
      let EVENTS = [];
      let SHIFTS = [];

      for (let v of shifts) {
        const _start = moment(`${prevDay} ${v.start_shift}`).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        const _end = moment(`${prevDay} ${v.start_shift}`)
          .add(v.duration, "hour")
          .format("YYYY-MM-DD HH:mm:ss");

        SHIFTS.push({
          kode: v.kode.toLowerCase(),
          name: v.name,
        });

        const _ritOB = (
          await DailyRitaseDetail.query(trx)
            .with("daily_ritase", (wh) => {
              wh.with("material_details");
            })
            .whereBetween("check_in", [_start, _end])
            .fetch()
        ).toJSON();
        const obActual = parseInt(
          _ritOB.reduce((a, b) => a + b.daily_ritase.material_details.vol, 0)
        );

        const obj = {
          name: v.kode.toUpperCase(),
          actual: obActual,
        };
        RIT_OB_ARR.push(obj);

        // coal ritase
        const ritaseCoal = (
          await DailyRitaseCoalDetail.query(trx)
            .whereBetween("checkout_jt", [_start, _end])
            .fetch()
        ).toJSON();

        const coalActual = parseInt(
          ritaseCoal.reduce((a, b) => a + b.w_netto, 0)
        );

        const obj_1 = {
          name: v.kode.toUpperCase(),
          actual: coalActual,
        };
        RIT_COAL_ARR.push(obj_1);

        const DAILY_EVENT = (
          await DailyEvent.query(trx)
            .with("event")
            .where("start_at", ">=", [_start])
            .andWhere("end_at", "<=", [_end])
            .orderBy("start_at", "asc")
            .fetch()
        ).toJSON();

        for (let z of DAILY_EVENT) {
          let obj_2 = {
            shift: v.kode.toLowerCase(),
            event_name: z.event.narasi,
            range_time: `${moment(z.start_at).format("LT")} - ${moment(
              z.end_at
            ).format("LT")}`,
          };
          EVENTS.push(obj_2);
        }
      }
      const _EVENTS = [];
      for (let x of SHIFTS) {
        const obj = {
          shift: x.name.toUpperCase(),
          data: EVENTS.filter((v) => v.shift === x.kode),
        };
        _EVENTS.push(obj);
      }

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

      const obActualToday = RIT_OB_ARR.reduce((a, b) => a + b.actual, 0);
      const coalActualToday = RIT_COAL_ARR.reduce((a, b) => a + b.actual, 0);

      let data = {
        daily_ob: {
          shift: RIT_OB_ARR,
          achieved: parseFloat(
            ((obActualToday / obPlanToday.estimate) * 100).toFixed(2)
          ),
          total: obActualToday,
          plan: obPlanToday.estimate,
          ritase_total: RIT_OB_ARR.length || 0,
        },
        daily_coal: {
          shift: RIT_COAL_ARR,
          total: coalActualToday,
          achieved: parseFloat(
            ((coalActualToday / coalPlanToday.estimate) * 100).toFixed(2)
          ),
          plan: coalPlanToday.estimate,
          ritase_total: RIT_COAL_ARR.length,
        },
        mtd_ob_actual_by_tc: _MTD_OB_ACTUAL_BY_TC,
        mtd_coal_actual_by_tc: _MTD_COAL_ACTUAL_BY_TC,
        mtd_coal_actual_by_tc_sr: MTD_COAL_SR,
        coal_expose: COAL_EXPOSE,
        mtd_coal_expose: MTD_COAL_EXPOSE,
        mtd_coal_expose_sr: MTD_COAL_EXPOSE_SR,
        event: _EVENTS,
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

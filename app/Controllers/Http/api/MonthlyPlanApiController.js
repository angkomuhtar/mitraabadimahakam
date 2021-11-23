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
const { infinityCheck, equipmentTypeCheck } = use(
  "App/Controllers/Http/customClass/utils"
);
const DailyFleet = use("App/Models/DailyFleet");
const DailyRitase = use("App/Models/DailyRitase");
const DailyRitaseCoal = use("App/Models/DailyRitaseCoal");
const MasFleet = use("App/Models/MasFleet");
const DailyChecklist = use("App/Models/DailyChecklist");
const DailyCoalExposed = use("App/Models/DailyCoalExposed");
const DailyFleetEquip = use("App/Models/DailyFleetEquip");
const MasPit = use("App/Models/MasPit");

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
      .andWhere("tipe", "OB")
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
      ).toJSON()

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
        pit_name: "GENERAL",
        data: data,

        pit_name: monthlyPlans.toJSON()?.pit?.name,
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
      .andWhere("tipe", "BB")
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
          actual: x.actual / 1000,
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

      console.log("weekly coal actual >> ", WEEKLY_COAL_ACTUAL);
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
        pit_name: "GENERAL",
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

  async getWeeklyOBProduction_v2({ request, response, auth }) {
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
    const trx = await db.beginTransaction();

    const SoM = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");

    const currentWeekDate = Array.from({ length: 7 }, (x, i) =>
      moment(date).startOf("week").add(i, "days").format("YYYY-MM-DD")
    );

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD HH:mm:ss");
    let _OB_ARR = [];

    const obj = {};
    try {
      const shifts = (await MasShift.query().fetch()).toJSON();
      const prevDay = moment(date).subtract(1, "days").format("YYYY-MM-DD");

      const masFleetOB = (
        await MasFleet.query(trx).where("tipe", "OB").fetch()
      ).toJSON();

      let counter = 0;

      for (let y of currentWeekDate) {
        for (let m of shifts) {
          const ctx = 1;
          counter += ctx;
          const _start = moment(`${y} ${m.start_shift}`).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          const _end = moment(`${y} ${m.start_shift}`)
            .add(12, "hour")
            .format("YYYY-MM-DD HH:mm:ss");

          const dailyFleetsOBSpecificPit = (
            await DailyFleet.query(trx)
              .whereIn(
                "fleet_id",
                masFleetOB.map((x) => x.id)
              )
              .andWhere("pit_id", _pit_id)
              .andWhere("created_at", ">=", _start)
              .andWhere("created_at", "<=", _end)
              .fetch()
          ).toJSON();

          const dailyRitaseOBSpecificFleet = (
            await DailyRitase.query(trx)
              .whereIn(
                "dailyfleet_id",
                dailyFleetsOBSpecificPit.map((x) => x.id)
              )
              .fetch()
          ).toJSON();

          const RITASE_OB = (
            await DailyRitaseDetail.query()
              .with("daily_ritase", (wh) => {
                wh.with("material_details");
              })
              .with("checker", (wh) => {
                wh.with("profile");
              })
              .with("spv", (wh) => {
                wh.with("profile");
              })
              .whereIn(
                "dailyritase_id",
                dailyRitaseOBSpecificFleet.map((v) => v.id)
              )
              .where("check_in", ">=", _start)
              .andWhere("check_in", "<=", _end)
              .fetch()
          ).toJSON();

          const ritaseDay = moment(y).format("ddd");
          const ritaseDate = moment(y).format("YYYY-MM-DD");

          let _obj = null;

          if (counter % 2 === 0) {
            _obj = {
              value: RITASE_OB.reduce(
                (a, b) => a + b.daily_ritase.material_details.vol,
                0
              ),
              frontColor: "#ED6665",
            };
          } else {
            _obj = {
              value: RITASE_OB.reduce(
                (a, b) => a + b.daily_ritase.material_details.vol,
                0
              ),
              label: ritaseDay.toLowerCase(),
              spacing: 2,
              labelWidth: 30,
              labelTextStyle: { color: "gray" },
              frontColor: "#177AD5",
            };
          }
          _OB_ARR.push(_obj);
        }
      }

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        pit_name: "GENERAL",
        data: _OB_ARR,
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

  async getWeeklyCoalProduction_v2({ request, response, auth }) {
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
    const trx = await db.beginTransaction();

    const SoM = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");

    const monthlyPlans = await MonthlyPlans.query()
      .with("pit")
      .where("month", SoM)
      .andWhere("tipe", "BB")
      .andWhere("pit_id", _pit_id)
      .first();

    const currentWeekDate = Array.from({ length: 7 }, (x, i) =>
      moment(date).startOf("week").add(i, "days").format("YYYY-MM-DD")
    );

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD HH:mm:ss");

    let _OB_ARR = [];

    const obj = {};
    try {
      const shifts = (await MasShift.query().fetch()).toJSON();
      const prevDay = moment(date).subtract(1, "days").format("YYYY-MM-DD");

      const masFleetCoal = (
        await MasFleet.query(trx).where("tipe", "CO").fetch()
      ).toJSON();

      let counter = 0;

      for (let y of currentWeekDate) {
        for (let m of shifts) {
          const ctx = 1;
          counter += ctx;
          const _start = moment(`${y} ${m.start_shift}`).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          const _end = moment(`${y} ${m.start_shift}`)
            .add(m.duration, "hour")
            .format("YYYY-MM-DD HH:mm:ss");
          const dailyFleetsCoalSpecificPit = (
            await DailyFleet.query(trx)
              .whereIn(
                "fleet_id",
                masFleetCoal.map((x) => x.id)
              )
              .andWhere("pit_id", _pit_id)
              .andWhere("created_at", ">=", _start)
              .andWhere("created_at", "<=", _end)
              .fetch()
          ).toJSON();

          const dailyRitaseCoalSpecificFleet = (
            await DailyRitaseCoal.query(trx)
              .whereIn(
                "dailyfleet_id",
                dailyFleetsCoalSpecificPit.map((x) => x.id)
              )
              .fetch()
          ).toJSON();

          const RITASE_COAL = (
            await DailyRitaseCoalDetail.query(trx)
              .whereIn(
                "ritasecoal_id",
                dailyRitaseCoalSpecificFleet.map((x) => x.id)
              )
              .where("checkout_jt", ">=", _start)
              .andWhere("checkout_jt", "<=", _end)
              .fetch()
          ).toJSON();

          const ritaseDay = moment(y).format("ddd");
          const ritaseDate = moment(y).format("YYYY-MM-DD");

          let _obj = null;

          if (counter % 2 === 0) {
            _obj = {
              value: RITASE_COAL.reduce((a, b) => a + b.w_netto, 0),
              frontColor: "#ED6665",
            };
          } else {
            _obj = {
              value: RITASE_COAL.reduce((a, b) => a + b.w_netto, 0),
              label: ritaseDay.toLowerCase(),
              spacing: 2,
              labelWidth: 30,
              labelTextStyle: { color: "gray" },
              frontColor: "#177AD5",
            };
          }
          _OB_ARR.push(_obj);
        }
      }

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        pit_name: "GENERAL",
        data: _OB_ARR,
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

  async getWeeklyFuel_v2({ request, response, auth }) {
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
    const trx = await db.beginTransaction();

    const SoM = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");

    const currentWeekDate = Array.from({ length: 7 }, (x, i) =>
      moment(date).startOf("week").add(i, "days").format("YYYY-MM-DD")
    );

    const SoW = moment(date).startOf("week").format("YYYY-MM-DD HH:mm:ss");

    let _OB_ARR = [];

    const obj = {};
    try {
      const shifts = (await MasShift.query().fetch()).toJSON();
      const prevDay = moment(date).subtract(1, "days").format("YYYY-MM-DD");

      let counter = 0;

      for (let y of currentWeekDate) {
        for (let m of shifts) {
          const ctx = 1;
          counter += ctx;
          const _start = moment(`${y} ${m.start_shift}`).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          const _end = moment(`${y} ${m.start_shift}`)
            .add(12, "hour")
            .format("YYYY-MM-DD HH:mm:ss");

          const dailyFleetsCoalSpecificPit = (
            await DailyFleet.query(trx)
              .where("pit_id", _pit_id)
              .andWhere("created_at", ">=", _start)
              .andWhere("created_at", "<=", _end)
              .fetch()
          ).toJSON();

          const dailyFleetEquipmentSpecificFleet = (
            await DailyFleetEquip.query(trx)
              .whereIn(
                "dailyfleet_id",
                dailyFleetsCoalSpecificPit.map((x) => x.id)
              )
              .fetch()
          ).toJSON();

          const REFUELING = (
            await DailyRefueling.query(trx)
              .whereIn(
                "equip_id",
                dailyFleetEquipmentSpecificFleet.map((x) => x.equip_id)
              )
              .where("fueling_at", ">=", _start)
              .andWhere("fueling_at", "<=", _end)
              .fetch()
          ).toJSON();

          const ritaseDay = moment(y).format("ddd");
          const ritaseDate = moment(y).format("YYYY-MM-DD");

          let _obj = null;

          if (counter % 2 === 0) {
            _obj = {
              value: REFUELING.reduce((a, b) => a + b.top_up, 0) || 0,
              frontColor: "#ED6665",
            };
          } else {
            _obj = {
              value: REFUELING.reduce((a, b) => a + b.top_up, 0) || 0,
              label: ritaseDay.toLowerCase(),
              spacing: 2,
              labelWidth: 30,
              labelTextStyle: { color: "gray" },
              frontColor: "#177AD5",
            };
          }
          _OB_ARR.push(_obj);
        }
      }

      durasi = await diagnoticTime.durasi(t0);
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        pit_name: "GENERAL",
        data: _OB_ARR,
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
    const { date, pit_id } = request.only(["date", "pit_id"]);

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

    const _pit_id = pit_id ? pit_id : 1;

    try {
      const allDailyFleetInASpecificPit = (
        await DailyFleet.query()
          .where("pit_id", _pit_id)
          .andWhere("date", ">=", SoW)
          .andWhere("date", "<=", EoW)
          .fetch()
      ).toJSON();

      const timeSheetSpecificPit = (
        await DailyChecklist.query()
          .whereIn(
            "dailyfleet_id",
            allDailyFleetInASpecificPit.map((x) => x.id)
          )
          .fetch()
      ).toJSON();

      dataPeriode = (
        await DailyRefueling.query()
          .whereIn(
            "timesheet_id",
            timeSheetSpecificPit.map((x) => x.id)
          )
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
      "pit_id",
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
                .reduce((a, b) => a + b.value / 1000, 0),
              plans:
                convertCoalsToMonthName.filter(
                  (v) => v.month_name === z.month_name
                )[0]?.plans || 0,
              ach:
                parseFloat(
                  (
                    (convertCoalsToMonthName
                      .filter((x) => x.month_name === z.month_name)
                      .reduce((a, b) => a + b.value / 1000, 0) /
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
    const { date, pit_id } = request.only(["date", "pit_id"]);
    let durasi;
    var t0 = performance.now();

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

    const trx = await db.beginTransaction();

    const checkIfStartOfMonth = () => {
      const _date = moment(date).format("DD");

      let prevMonth = null;
      if (_date === "01") {
        prevMonth = moment(date)
          .subtract(1, "days")
          .startOf("month")
          .format("YYYY-MM-DD HH:mm:ss");
      } else {
        prevMonth = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");
      }

      return prevMonth;
    };
    const SoM = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");

    const monthlyPlansOB = await MonthlyPlans.query()
      .with("pit")
      .where("month", checkIfStartOfMonth(SoM))
      .andWhere("pit_id", _pit_id)
      .andWhere("tipe", "OB")
      .first();

    const monthlyPlansCoal = await MonthlyPlans.query()
      .with("pit")
      .where("month", checkIfStartOfMonth(SoM))
      .andWhere("pit_id", _pit_id)
      .andWhere("tipe", "BB")
      .first();

    const MONTHLYPLANS_OB_ID = monthlyPlansOB?.id;
    const MONTHLYPLANS_CO_ID = monthlyPlansCoal?.id;

    try {
      const today = moment(date).format("YYYY-MM-DD");
      const prevDay = moment(date).subtract(1, "days").format("YYYY-MM-DD");

      const shifts = (await MasShift.query().fetch()).toJSON();

      // Daily Plans, Breakdown from Monthly Plans / Number of Days in month
      const coalPlanToday = await DailyPlans.query(trx)
        .where("current_date", prevDay)
        .andWhere("tipe", "COAL")
        .andWhere("monthlyplans_id", MONTHLYPLANS_CO_ID)
        .first();

      const obPlanToday = await DailyPlans.query(trx)
        .where("current_date", prevDay)
        .andWhere("tipe", "OB")
        .andWhere("monthlyplans_id", MONTHLYPLANS_OB_ID)
        .first();

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

        const masFleetOB = (
          await MasFleet.query(trx).where("tipe", "OB").fetch()
        ).toJSON();

        const dailyFleetsOBSpecificPit = (
          await DailyFleet.query(trx)
            .whereIn(
              "fleet_id",
              masFleetOB.map((x) => x.id)
            )
            .andWhere("pit_id", _pit_id)
            .andWhere("created_at", ">=", _start)
            .andWhere("created_at", "<=", _end)
            .fetch()
        ).toJSON();

        const dailyRitaseOBSpecificFleet = (
          await DailyRitase.query(trx)
            .whereIn(
              "dailyfleet_id",
              dailyFleetsOBSpecificPit.map((x) => x.id)
            )
            .fetch()
        ).toJSON();

        const _ritOB = (
          await DailyRitaseDetail.query(trx)
            .with("daily_ritase", (wh) => {
              wh.with("material_details");
            })
            .with("checker", (wh) => {
              wh.with("profile");
            })
            .with("spv", (wh) => {
              wh.with("profile");
            })
            .whereIn(
              "dailyritase_id",
              dailyRitaseOBSpecificFleet.map((x) => x.id)
            )
            .where("check_in", ">=", _start)
            .andWhere("check_in", "<=", _end)
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
        const masFleetCoal = (
          await MasFleet.query(trx).where("tipe", "CO").fetch()
        ).toJSON();

        const dailyFleetsCoalSpecificPit = (
          await DailyFleet.query(trx)
            .whereIn(
              "fleet_id",
              masFleetCoal.map((x) => x.id)
            )
            .where("pit_id", _pit_id)
            .andWhere("created_at", ">=", _start)
            .andWhere("created_at", "<=", _end)
            .fetch()
        ).toJSON();

        const dailyRitaseCoalSpecificFleet = (
          await DailyRitaseCoal.query(trx)
            .whereIn(
              "dailyfleet_id",
              dailyFleetsCoalSpecificPit.map((x) => x.id)
            )
            .fetch()
        ).toJSON();

        const ritaseCoal = (
          await DailyRitaseCoalDetail.query(trx)
            .whereIn(
              "ritasecoal_id",
              dailyRitaseCoalSpecificFleet.map((x) => x.id)
            )
            .where("checkout_jt", ">=", _start)
            .andWhere("checkout_jt", "<=", _end)
            .fetch()
        ).toJSON();

        const coalActual = parseInt(
          ritaseCoal.reduce((a, b) => a + b.w_netto, 0)
        );

        const obj_1 = {
          name: v.kode.toUpperCase(),
          actual: coalActual / 1000,
        };
        RIT_COAL_ARR.push(obj_1);

        const allDailyFleetInASpecificPit = (
          await DailyFleet.query(trx)
            .where("pit_id", _pit_id)
            .andWhere("created_at", ">=", _start)
            .andWhere("created_at", "<=", _end)
            .fetch()
        ).toJSON();

        const timeSheetSpecificPit = (
          await DailyChecklist.query(trx)
            .whereIn(
              "dailyfleet_id",
              allDailyFleetInASpecificPit.map((x) => x.id)
            )
            .fetch()
        ).toJSON();

        const DAILY_EVENT = (
          await DailyEvent.query(trx)
            .with("event")
            .whereIn(
              "timesheet_id",
              timeSheetSpecificPit.map((x) => x.id)
            )
            .where("start_at", ">=", _start)
            .andWhere("end_at", "<=", _end)
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

      const _COAL_EXPOSE_TODAY = await DailyCoalExposed.query()
        .where("tgl", now)
        .andWhere("pit_id", _pit_id)
        .andWhere("aktif", "Y")
        .first();
      const _MTD_COAL_EXPOSE = (
        await DailyCoalExposed.query()
          .where("tgl", ">=", checkIfStartOfMonth(SoM))
          .andWhere("tgl", "<=", now)
          .andWhere("pit_id", _pit_id)
          .andWhere("aktif", "Y")
          .fetch()
      ).toJSON();

      const mtd_ob_actual = (
        await DailyPlans.query(trx)
          .whereBetween("current_date", [checkIfStartOfMonth(SoM), now])
          .where("tipe", "OB")
          .andWhere("monthlyplans_id", MONTHLYPLANS_OB_ID)
          .fetch()
      ).toJSON();

      const mtd_coal_actual = (
        await DailyPlans.query(trx)
          .whereBetween("current_date", [checkIfStartOfMonth(SoM), now])
          .where("tipe", "COAL")
          .andWhere("monthlyplans_id", MONTHLYPLANS_CO_ID)
          .fetch()
      ).toJSON();

      const _MTD_COAL_ACTUAL_BY_TC = parseInt(
        mtd_coal_actual.reduce((a, b) => a + b.actual / 1000, 0)
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

      const COAL_EXPOSE = _COAL_EXPOSE_TODAY
        ? _COAL_EXPOSE_TODAY.volume / 1000
        : 0;
      const MTD_COAL_EXPOSE = _MTD_COAL_EXPOSE
        ? _MTD_COAL_EXPOSE.reduce((a, b) => a + b.volume, 0)
        : 0;

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
        },
        daily_coal: {
          shift: RIT_COAL_ARR,
          total: coalActualToday,
          achieved: parseFloat(
            ((coalActualToday / coalPlanToday.estimate) * 100).toFixed(2)
          ),
          plan: coalPlanToday.estimate,
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
        pit_name: monthlyPlansCoal.toJSON()?.pit?.name,
        checker: {},
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

  async getDailyReport_v2({ auth, request, response }) {
    const { date, pit_id } = request.only(["date", "pit_id"]);
    let durasi;
    var t0 = performance.now();

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

    const trx = await db.beginTransaction();

    const checkIfStartOfMonth = () => {
      const _date = moment(date).format("DD");

      let prevMonth = null;
      if (_date === "01") {
        prevMonth = moment(date)
          .subtract(1, "days")
          .startOf("month")
          .format("YYYY-MM-DD HH:mm:ss");
      } else {
        prevMonth = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");
      }

      return prevMonth;
    };
    const SoM = moment(date).startOf("month").format("YYYY-MM-DD HH:mm:ss");

    const monthlyPlansOB = await MonthlyPlans.query()
      .with("pit")
      .where("month", checkIfStartOfMonth(SoM))
      .andWhere("pit_id", _pit_id)
      .andWhere("tipe", "OB")
      .first();

    const monthlyPlansCoal = await MonthlyPlans.query()
      .with("pit")
      .where("month", checkIfStartOfMonth(SoM))
      .andWhere("pit_id", _pit_id)
      .andWhere("tipe", "BB")
      .first();

    const MONTHLYPLANS_OB_ID = monthlyPlansOB?.id;
    const MONTHLYPLANS_CO_ID = monthlyPlansCoal?.id;

    try {
      const today = moment(date).format("YYYY-MM-DD");
      const prevDay = moment(date).subtract(1, "days").format("YYYY-MM-DD");

      const shifts = (await MasShift.query().fetch()).toJSON();

      // Daily Plans, Breakdown from Monthly Plans / Number of Days in month
      const coalPlanToday = await DailyPlans.query(trx)
        .where("current_date", prevDay)
        .andWhere("tipe", "COAL")
        .andWhere("monthlyplans_id", MONTHLYPLANS_CO_ID)
        .first();

      const obPlanToday = await DailyPlans.query(trx)
        .where("current_date", prevDay)
        .andWhere("tipe", "OB")
        .andWhere("monthlyplans_id", MONTHLYPLANS_OB_ID)
        .first();

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

        const masFleetOB = (
          await MasFleet.query(trx).where("tipe", "OB").fetch()
        ).toJSON();

        const dailyFleetsOBSpecificPit = (
          await DailyFleet.query(trx)
            .whereIn(
              "fleet_id",
              masFleetOB.map((x) => x.id)
            )
            .andWhere("pit_id", _pit_id)
            .andWhere("created_at", ">=", _start)
            .andWhere("created_at", "<=", _end)
            .fetch()
        ).toJSON();

        const dailyRitaseOBSpecificFleet = (
          await DailyRitase.query(trx)
            .whereIn(
              "dailyfleet_id",
              dailyFleetsOBSpecificPit.map((x) => x.id)
            )
            .fetch()
        ).toJSON();

        const _ritOB = (
          await DailyRitaseDetail.query(trx)
            .with("daily_ritase", (wh) => {
              wh.with("material_details");
            })
            .with("checker", (wh) => {
              wh.with("profile");
            })
            .with("spv", (wh) => {
              wh.with("profile");
            })
            .whereIn(
              "dailyritase_id",
              dailyRitaseOBSpecificFleet.map((x) => x.id)
            )
            .where("check_in", ">=", _start)
            .andWhere("check_in", "<=", _end)
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
        const masFleetCoal = (
          await MasFleet.query(trx).where("tipe", "CO").fetch()
        ).toJSON();

        const dailyFleetsCoalSpecificPit = (
          await DailyFleet.query(trx)
            .whereIn(
              "fleet_id",
              masFleetCoal.map((x) => x.id)
            )
            .where("pit_id", _pit_id)
            .andWhere("created_at", ">=", _start)
            .andWhere("created_at", "<=", _end)
            .fetch()
        ).toJSON();

        const dailyRitaseCoalSpecificFleet = (
          await DailyRitaseCoal.query(trx)
            .whereIn(
              "dailyfleet_id",
              dailyFleetsCoalSpecificPit.map((x) => x.id)
            )
            .fetch()
        ).toJSON();

        const ritaseCoal = (
          await DailyRitaseCoalDetail.query(trx)
            .whereIn(
              "ritasecoal_id",
              dailyRitaseCoalSpecificFleet.map((x) => x.id)
            )
            .where("checkout_jt", ">=", _start)
            .andWhere("checkout_jt", "<=", _end)
            .fetch()
        ).toJSON();

        const coalActual = parseInt(
          ritaseCoal.reduce((a, b) => a + b.w_netto, 0)
        );

        const obj_1 = {
          name: v.kode.toUpperCase(),
          actual: coalActual / 1000,
        };
        RIT_COAL_ARR.push(obj_1);

        const allDailyFleetInASpecificPit = (
          await DailyFleet.query(trx)
            .where("pit_id", _pit_id)
            .andWhere("created_at", ">=", _start)
            .andWhere("created_at", "<=", _end)
            .fetch()
        ).toJSON();

        const timeSheetSpecificPit = (
          await DailyChecklist.query(trx)
            .whereIn(
              "dailyfleet_id",
              allDailyFleetInASpecificPit.map((x) => x.id)
            )
            .fetch()
        ).toJSON();

        const DAILY_EVENT = (
          await DailyEvent.query(trx)
            .with("event")
            .whereIn(
              "timesheet_id",
              timeSheetSpecificPit.map((x) => x.id)
            )
            .where("start_at", ">=", _start)
            .andWhere("end_at", "<=", _end)
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

      const _COAL_EXPOSE_TODAY = await DailyCoalExposed.query()
        .where("tgl", now)
        .andWhere("pit_id", _pit_id)
        .andWhere("aktif", "Y")
        .first();
      const _MTD_COAL_EXPOSE = (
        await DailyCoalExposed.query()
          .where("tgl", ">=", checkIfStartOfMonth(SoM))
          .andWhere("tgl", "<=", now)
          .andWhere("pit_id", _pit_id)
          .andWhere("aktif", "Y")
          .fetch()
      ).toJSON();

      const mtd_ob_actual = (
        await DailyPlans.query(trx)
          .whereBetween("current_date", [checkIfStartOfMonth(SoM), now])
          .where("tipe", "OB")
          .andWhere("monthlyplans_id", MONTHLYPLANS_OB_ID)
          .fetch()
      ).toJSON();

      const mtd_coal_actual = (
        await DailyPlans.query(trx)
          .whereBetween("current_date", [checkIfStartOfMonth(SoM), now])
          .where("tipe", "COAL")
          .andWhere("monthlyplans_id", MONTHLYPLANS_CO_ID)
          .fetch()
      ).toJSON();

      const _MTD_COAL_ACTUAL_BY_TC = parseInt(
        mtd_coal_actual.reduce((a, b) => a + b.actual / 1000, 0)
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

      const COAL_EXPOSE = _COAL_EXPOSE_TODAY
        ? _COAL_EXPOSE_TODAY.volume / 1000
        : 0;
      const MTD_COAL_EXPOSE = _MTD_COAL_EXPOSE
        ? _MTD_COAL_EXPOSE.reduce((a, b) => a + b.volume, 0)
        : 0;

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
        },
        daily_coal: {
          shift: RIT_COAL_ARR,
          total: coalActualToday,
          achieved: parseFloat(
            ((coalActualToday / coalPlanToday.estimate) * 100).toFixed(2)
          ),
          plan: coalPlanToday.estimate,
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
        pit_name: monthlyPlansCoal.toJSON()?.pit?.name,
        checker: {},
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

  async getExcaProductivity_OB({ auth, request, response }) {
    const { __date, pit_id, page, limit } = request.only([
      "__date",
      "pit_id",
      "page",
      "limit",
    ]);
    let durasi;

    const _page = parseInt(page) || 1;
    const _limit = parseInt(limit) || 2;
    const startIndex = _page - 1;
    const endIndex = _page * _limit;
    const paginate = {};

    var t0 = performance.now();

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

    const shifts = (await MasShift.query().fetch()).toJSON();
    const date = moment(__date).format("YYYY-MM-DD");

    let data = [];
    let onShift = null;

    for (let x of shifts) {
      const _start = moment(`${date} ${x.start_shift}`).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const _end = moment(`${date} ${x.start_shift}`)
        .add(x.duration, "hour")
        .format("YYYY-MM-DD HH:mm:ss");

      const masFleetOB = (
        await MasFleet.query().where("tipe", "OB").fetch()
      ).toJSON();

      if (
        new Date(__date) >= new Date(_start) &&
        new Date(__date) <= new Date(_end)
      ) {
        onShift = x.kode;
        const check = (
          await DailyFleet.query()
            .with("pit")
            .whereIn(
              "fleet_id",
              masFleetOB.map((x) => x.id)
            )
            .andWhere("created_at", ">=", _start)
            .andWhere("created_at", "<=", _end)
            .fetch()
        ).toJSON();

        let dailyFleets = [];
        let hours = [];
        if (!check.length) {
          const prevShiftStart = moment(_start)
            .subtract(x.duration, "hour")
            .format("YYYY-MM-DD HH:mm:ss");
          const prevShiftEnd = moment(_start).format("YYYY-MM-DD HH:mm:ss");
          dailyFleets = (
            await DailyFleet.query()
              .with("pit")
              .whereIn(
                "fleet_id",
                masFleetOB.map((x) => x.id)
              )
              .andWhere("created_at", ">=", prevShiftStart)
              .andWhere("created_at", "<=", prevShiftEnd)
              .fetch()
          ).toJSON();
          hours = Array.from({ length: x.duration + 1 }, (a, y) => {
            return moment(`${prevShiftStart}`)
              .add(60 * y, "minutes")
              .format("YYYY-MM-DD HH:mm:ss");
          });
        } else {
          dailyFleets = (
            await DailyFleet.query()
              .with("pit")
              .whereIn(
                "fleet_id",
                masFleetOB.map((x) => x.id)
              )
              .andWhere("created_at", ">=", _start)
              .andWhere("created_at", "<=", _end)
              .fetch()
          ).toJSON();
          hours = Array.from({ length: x.duration + 1 }, (a, y) => {
            return moment(`${date} ${x.start_shift}`)
              .add(60 * y, "minutes")
              .format("YYYY-MM-DD HH:mm:ss");
          });
        }

        const dailyRitase = (
          await DailyRitase.query()
            .whereIn(
              "dailyfleet_id",
              dailyFleets.map((v) => v.id)
            )
            .fetch()
        ).toJSON();

        const getMaterialNameByFleetId = async (id) => {
          const dailyRitase = await DailyRitase.query()
            .with("material_details")
            .where("dailyfleet_id", id)
            .first();
          let materialName = null;

          if (dailyRitase || dailyRitase.toJSON()) {
            const q = dailyRitase.toJSON().material_details.name;
            materialName = q.includes("/") ? q.split("/")[0] : q;
          } else {
            materialName = null;
          }

          return materialName;
        };

        let arr = [];
        for (let i = 1; i < hours.length; i++) {
          const obj = {
            data: {
              start: moment(hours[i])
                .subtract(1, "hour")
                .format("YYYY-MM-DD HH:mm:ss"),
              end: hours[i],
            },
          };
          arr.push(obj);
        }

        const getOBProductionByFleet = async (fleetId, y) => {
          const dailyRitase = await DailyRitase.query()
            .with("material_details")
            .where("dailyfleet_id", fleetId)
            .first();
          let acc = 0;

          if (dailyRitase || dailyRitase.toJSON()) {
            const dailyRitaseDetails = (
              await DailyRitaseDetail.query()
                .with("daily_ritase", (wh) => {
                  wh.with("material_details");
                })
                .where("dailyritase_id", dailyRitase.toJSON().id)
                .andWhere("check_in", ">=", y.data.start)
                .andWhere("check_in", "<=", y.data.end)
                .fetch()
            ).toJSON();

            const totalValueOB = dailyRitaseDetails.reduce(
              (a, b) => a + b.daily_ritase.material_details.vol,
              0
            );

            acc = {
              val: totalValueOB,
              totalRitase: dailyRitaseDetails.length,
            };
          } else {
            acc = {
              val: 0,
              totalRitase: 0,
            };
          }

          return acc;
        };

        for (let y of arr) {
          const getExcaByDailyFleet = (
            await DailyFleet.query()
              .with("pit")
              .whereIn(
                "id",
                dailyRitase.map((v) => v.dailyfleet_id)
              )
              .fetch()
          ).toJSON();

          const getHourlyTargetBCM = async (pit_id) => {
            const SoM = moment(date)
              .startOf("month")
              .format("YYYY-MM-DD HH:mm:ss");

            const monthlyPlansOB = await MonthlyPlans.query()
              .where("pit_id", pit_id)
              .andWhere("month", SoM)
              .andWhere("tipe", "OB")
              .first();

            const dailyPlans = await DailyPlans.query()
              .where("current_date", date)
              .andWhere("monthlyplans_id", monthlyPlansOB.id)
              .first();

            const hourlyTarget = parseInt(
              (parseInt(dailyPlans.estimate) / 22).toFixed(2)
            );
            return hourlyTarget;
          };

          for (const m of getExcaByDailyFleet) {
            const dailyFleetEquips = (
              await DailyFleetEquip.query()
                .with("equipment")
                .where("dailyfleet_id", m.id)
                .fetch()
            ).toJSON();

            const excaName = dailyFleetEquips.filter(
              (v) => v.equipment.tipe === "excavator"
            )[0].equipment.kode;

            const obj = {
              date: moment(y.data.start).format("DD MMM"),
              rangeTime: `${moment(y.data.start).format("HH:mm")} ~ ${moment(
                y.data.end
              ).format("HH:mm")}`,
              exca: excaName,
              value: (await getOBProductionByFleet(m.id, y)).val,
              onPit: m.pit.name,
              unit: "BCM",
              hourlyTarget: await getHourlyTargetBCM(m.pit.id),
              achieved:
                (
                  ((await getOBProductionByFleet(m.id, y)).val /
                    (await getHourlyTargetBCM(m.pit.id))) *
                  100
                ).toFixed(2) + " %",
              totalRitase: (await getOBProductionByFleet(m.id, y)).totalRitase,
              materialName: await getMaterialNameByFleetId(m.id),
            };
            data.push(obj);
          }
        }
      }
    }

    if (endIndex < data.length) {
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

    return response.status(200).json({
      ...paginate,
      diagnostic: {
        times: durasi,
        error: false,
        request_time: date,
        server_time: moment(date).format("YYYY-MM-DD"),
      },
      data: data.slice(0, endIndex),
      arrLength: data.length,
      onShift: onShift,
    });
  }

  async getExcaProductivity_COAL({ auth, request, response }) {
    const { __date, pit_id, page, limit } = request.only([
      "__date",
      "pit_id",
      "page",
      "limit",
    ]);
    let durasi;

    var t0 = performance.now();

    const _page = parseInt(page) || 1;
    const _limit = parseInt(limit) || 2;
    const startIndex = _page - 1;
    const endIndex = _page * _limit;
    const paginate = {};

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

    const shifts = (await MasShift.query().fetch()).toJSON();
    const date = moment(__date).format("YYYY-MM-DD");

    let data = [];
    let onShift = null;

    for (let x of shifts) {
      const _start = moment(`${date} ${x.start_shift}`).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const _end = moment(`${date} ${x.start_shift}`)
        .add(x.duration, "hour")
        .format("YYYY-MM-DD HH:mm:ss");

      if (
        new Date(__date) >= new Date(_start) &&
        new Date(__date) <= new Date(_end)
      ) {
        onShift = x.kode;
        let dailyFleets = [];

        const masFleetCoal = (
          await MasFleet.query().where("tipe", "CO").fetch()
        ).toJSON();

        const check = (
          await DailyFleet.query()
            .with("pit")
            .whereIn(
              "fleet_id",
              masFleetCoal.map((x) => x.id)
            )
            .andWhere("created_at", ">=", _start)
            .andWhere("created_at", "<=", _end)
            .fetch()
        ).toJSON();

        let hours = [];

        if (!check.length) {
          const prevShiftStart = moment(_start)
            .subtract(x.duration, "hour")
            .format("YYYY-MM-DD HH:mm:ss");
          const prevShiftEnd = moment(_start).format("YYYY-MM-DD HH:mm:ss");

          dailyFleets = (
            await DailyFleet.query()
              .with("pit")
              .whereIn(
                "fleet_id",
                masFleetCoal.map((x) => x.id)
              )
              .andWhere("created_at", ">=", prevShiftStart)
              .andWhere("created_at", "<=", prevShiftEnd)
              .fetch()
          ).toJSON();

          hours = Array.from({ length: x.duration + 1 }, (a, y) => {
            return moment(`${prevShiftStart}`)
              .add(60 * y, "minutes")
              .format("YYYY-MM-DD HH:mm:ss");
          });
        } else {
          dailyFleets = (
            await DailyFleet.query()
              .with("pit")
              .whereIn(
                "fleet_id",
                masFleetCoal.map((x) => x.id)
              )
              .andWhere("created_at", ">=", _start)
              .andWhere("created_at", "<=", _end)
              .fetch()
          ).toJSON();

          hours = Array.from({ length: x.duration + 1 }, (a, y) => {
            return moment(`${date} ${x.start_shift}`)
              .add(60 * y, "minutes")
              .format("YYYY-MM-DD HH:mm:ss");
          });
        }

        const dailyRitase = (
          await DailyRitaseCoal.query()
            .whereIn(
              "dailyfleet_id",
              dailyFleets.map((v) => v.id)
            )
            .fetch()
        ).toJSON();

        let arr = [];
        for (let i = 1; i < hours.length; i++) {
          const obj = {
            data: {
              start: moment(hours[i])
                .subtract(1, "hour")
                .format("YYYY-MM-DD HH:mm:ss"),
              end: hours[i],
            },
          };
          arr.push(obj);
        }

        const getCoalProductionPerShift = async (fleetId, y) => {
          const dailyRitase = await DailyRitaseCoal.query()
            .where("dailyfleet_id", fleetId)
            .first();
          let result = null;

          if (dailyRitase || dailyRitase.toJSON()) {
            const dailyRitaseDetails = (
              await DailyRitaseCoalDetail.query()
                .where("ritasecoal_id", dailyRitase.toJSON().id)
                .andWhere("checkout_jt", ">=", y.data.start)
                .andWhere("checkout_jt", "<=", y.data.end)
                .fetch()
            ).toJSON();

            const totalValueCoal = dailyRitaseDetails.reduce(
              (a, b) => a + b.w_netto,
              0
            );

            result = {
              val: totalValueCoal / 1000,
              totalRitase: dailyRitaseDetails.length,
            };
          } else {
            result = {
              val: 0,
              totalRitase: 0,
            };
          }
          return result;
        };

        for (let y of arr) {
          const getExcaByDailyFleet = (
            await DailyFleet.query()
              .with("pit")
              .whereIn(
                "id",
                dailyRitase.map((v) => v.dailyfleet_id)
              )
              .fetch()
          ).toJSON();

          const getHourlyTargetMT = async (pit_id) => {
            const SoM = moment(date)
              .startOf("month")
              .format("YYYY-MM-DD HH:mm:ss");

            const monthlyPlansOB = await MonthlyPlans.query()
              .where("pit_id", pit_id)
              .andWhere("month", SoM)
              .andWhere("tipe", "BB")
              .first();

            if (monthlyPlansOB) {
              const dailyPlans = await DailyPlans.query()
                .where("current_date", date)
                .andWhere("monthlyplans_id", monthlyPlansOB.id)
                .first();

              const hourlyTarget = parseInt(
                (parseInt(dailyPlans.estimate) / 22).toFixed(2)
              );
              return hourlyTarget;
            } else {
              return 0;
            }
          };

          for (const m of getExcaByDailyFleet) {
            const dailyFleetEquips = (
              await DailyFleetEquip.query()
                .with("equipment")
                .where("dailyfleet_id", m.id)
                .fetch()
            ).toJSON();

            const excaName = dailyFleetEquips.filter(
              (v) => v.equipment.tipe === "excavator"
            )[0].equipment.kode;

            const obj = {
              date: moment(y.data.start).format("DD MMM"),
              rangeTime: `${moment(y.data.start).format("HH:mm")} ~ ${moment(
                y.data.end
              ).format("HH:mm")}`,
              exca: excaName,
              value: (await getCoalProductionPerShift(m.id, y)).val,
              onPit: m.pit.name,
              unit: "MT",
              hourlyTarget: await getHourlyTargetMT(m.pit.id),
              achieved:
                (
                  ((await getCoalProductionPerShift(m.id, y)).val /
                    (await getHourlyTargetMT(m.pit.id))) *
                  100
                ).toFixed(2) + " %",
              totalRitase: (await getCoalProductionPerShift(m.id, y))
                .totalRitase,
            };
            data.push(obj);
          }
        }
      }
    }

    if (endIndex < data.length) {
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

    return response.status(200).json({
      diagnostic: {
        times: durasi,
        error: false,
        request_time: date,
        server_time: moment(date).format("YYYY-MM-DD"),
      },
      data: data.slice(0, endIndex),
      arrLength: data.length,
      onShift: onShift,
    });
  }

  async recentUnitRefueling({ auth, request, response }) {
    const { date, page, limit } = request.only(["date", "page", "limit"]);

    // top level variables
    let durasi;
    var t0 = performance.now();
    const _page = parseInt(page) || 1;
    const _limit = parseInt(limit) || 2;
    const startIndex = _page - 1;
    const endIndex = _page * _limit;
    const paginate = {};
    let data = [];
    let ids = [];
    // auth check
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

    // vars
    const StartOfDay = moment(date)
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const EndOfDay = moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss");

    // master data
    const shifts = (await MasShift.query().fetch()).toJSON();

    // queries
    const equipsRefueling = (
      await DailyRefueling.query()
        .where("fueling_at", ">=", StartOfDay)
        .andWhere("fueling_at", "<=", EndOfDay)
        .andWhere("topup", "!=", "0.00")
        .fetch()
    ).toJSON();

    const GET_REFUELING_UNIT_BY_UNIT_ID = async (unitId) => {
      let result = null;

      const dailyFleetEquips = await DailyFleetEquip.query()
        .with("dailyFleet", (wh) => {
          wh.with("pit");
        })
        .with("equipment")
        .where("datetime", ">=", StartOfDay)
        .andWhere("equip_id", unitId)
        .andWhere("datetime", "<=", EndOfDay)
        .first();

      if (dailyFleetEquips) {
        const singleUnit = dailyFleetEquips?.toJSON();
        const equipName = singleUnit?.equipment?.kode;
        const pitName = singleUnit?.dailyFleet?.pit?.name;
        return {
          pitName,
          equipName,
          equipmentImg: singleUnit?.equipment.img_uri
            ? singleUnit?.equipment.img_uri
            : `${process.env.APP_URL}/images/img_not_found.png`,
          brand: singleUnit?.equipment.brand,
          type: await equipmentTypeCheck(singleUnit?.equipment.tipe),
        };
      } else {
        result = null;
      }
      return result;
    };

    for (const x of equipsRefueling) {
      const unitData = await GET_REFUELING_UNIT_BY_UNIT_ID(x.equip_id);
      if (unitData) {
        const _data = {
          pitName: unitData.pitName,
          equipName: unitData.equipName,
          equipmentImg: unitData.equipmentImg,
          topup: x.topup,
          smu: x.smu,
          topupAt: moment(x.fueling_at).format("DD MMM HH:mm"),
          unit: "L",
          equipType: unitData.type,
          equipBrand: unitData.brand,
        };
        data.push(_data);
      }
    }

    // pagination
    if (endIndex < data.length) {
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

    // response to client
    return response.status(200).json({
      ...paginate,
      diagnostic: {
        times: durasi,
        error: false,
        request_time: date,
        server_time: moment(date).format("YYYY-MM-DD"),
      },
      data: data.slice(0, endIndex),
      arrLength: data.length,
    });
  }

  async getRangeMonthFuelBurn({ request, auth, response }) {
    const { date, pit_id } = request.only(["date", "pit_id"]);

    // top level variables
    let durasi;
    var t0 = performance.now();
    const _pit_id = pit_id ? pit_id : 6;

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

    const monthArrays = Array.from({ length: 12 }).map((v, y) => {
      return moment().startOf("year").add(y, "M").format("YYYY-MM-DD");
    });

    const months = [];

    for (const x of monthArrays) {
      const obj = {
        monthName: moment(x).format("MMM"),
        startOfMonth: moment(x).startOf("M").format("YYYY-MM-DD HH:mm:ss"),
        endOfMonth: moment(x).endOf("M").format("YYYY-MM-DD HH:mm:ss"),
      };
      months.push(obj);
    }
    let arrOfMonth = [
      {
        data: months.slice(0, 6),
      },
      {
        data: months.slice(6, 12),
      },
    ];

    const currentMonth = moment(date).format("MMM");

    const _months = [];
    for (const x of arrOfMonth) {
      for (const y of x.data) {
        if (y.monthName === currentMonth) {
          _months.push(x);
        }
      }
    }

    const pitName = (await MasPit.query().where("id", _pit_id).first())?.name;

    const dats = [];
    for (const x of _months[0].data) {
      const dailyFleetSpecificPit = (
        await DailyFleet.query()
          .where("created_at", ">=", x.startOfMonth)
          .andWhere("created_at", "<=", x.endOfMonth)
          .andWhere("pit_id", _pit_id)
          .fetch()
      ).toJSON();

      const dailyTimeSheetSpecificFleet = (
        await DailyChecklist.query()
          .whereIn(
            "dailyfleet_id",
            dailyFleetSpecificPit.map((v) => v.id)
          )
          .whereNotNull("used_smu")
          .andWhere("used_smu", "!=", "0.00")
          .fetch()
      ).toJSON();

      const dailyRefuelings = (
        await DailyRefueling.query()
          .with("timesheet")
          .whereIn(
            "timesheet_id",
            dailyTimeSheetSpecificFleet.map((v) => v.id)
          )
          .whereNotNull("timesheet_id")
          .andWhere("topup", "!=", "0.00")
          .andWhere("fueling_at", ">=", x.startOfMonth)
          .andWhere("fueling_at", "<=", x.endOfMonth)
          .fetch()
      ).toJSON();

      dats.push({
        value: parseInt(
          parseFloat(
            dailyRefuelings.reduce((a, b) => a + b.timesheet.used_smu, 0)
          ).toFixed(2)
        ),
        frontColor: "#ED6665",
        label: x.monthName,
        spacing: 2,
        labelWidth: 30,
        labelTextStyle: { color: "gray" },
      });

      dats.push({
        value: dailyRefuelings.reduce((a, b) => a + b.topup, 0),
        frontColor: "#177AD5",
      });
    }

    // response to client
    return response.status(200).json({
      diagnostic: {
        times: durasi,
        error: false,
        request_time: date,
        server_time: moment(date).format("YYYY-MM-DD"),
      },
      data: dats,
      pitName: pitName,
    });
  }
}

module.exports = MonthlyPlanApiController;

"use strict";
const { performance } = require("perf_hooks");
const moment = require("moment");
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime");

const db = use("Database");
const Fleet = use("App/Models/MasFleet");
const DailyFleet = use("App/Models/DailyFleet");
const MasEquipment = use("App/Models/MasEquipment");
const DailyFleetEquip = use("App/Models/DailyFleetEquip");
const Database = use("Database");
const MasShift = use("App/Models/MasShift");

var initString = "YYYY-MM-DD";

class DailyFleetApiController {
  async index({ auth, request, response }) {
    var t0 = performance.now();
    const req = request.only(["keyword"]);

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
        data: {},
      });
    }

    let dailyFleet;
    if (req.keyword) {
      dailyFleet = await DailyFleet.query()
        .with("pit", (a) => {
          a.where("kode", "like", `%${req.keyword}%`);
          a.orWhere("name", "like", `%${req.keyword}%`);
          a.orWhere("location", "like", `%${req.keyword}%`);
        })
        .with("fleet", (b) => {
          b.where("kode", "like", `%${req.keyword}%`);
          b.orWhere("name", "like", `%${req.keyword}%`);
        })
        .with("activities", (c) => {
          c.where("kode", "like", `%${req.keyword}%`);
          c.orWhere("name", "like", `%${req.keyword}%`);
          c.orWhere("keterangan", "like", `%${req.keyword}%`);
        })
        .with("shift", (d) => {
          d.where("kode", "like", `%${req.keyword}%`);
          d.orWhere("name", "like", `%${req.keyword}%`);
          d.orWhere("duration", "like", `%${req.keyword}%`);
        })
        .with("details", (e) => {
          e.with("equipment");
        })
        .with("user")
        .orderBy("date")
        .fetch();
    } else {
      dailyFleet = await DailyFleet.query()
        .with("pit")
        .with("fleet")
        .with("activities")
        .with("shift")
        .with("details", (e) => {
          e.with("equipment");
        })
        .with("user")
        .orderBy("date")
        .fetch();
    }

    let durasi = await diagnoticTime.durasi(t0);
    return response.status(200).json({
      diagnostic: {
        times: durasi,
        error: false,
      },
      data: dailyFleet,
    });
  }

  /** show data based today and previous day */
  async filterByDate({ auth, response, request }) {
    var t0 = performance.now();
    const { begin_date, end_date, isFilter, filter } = request.only([
      "begin_date",
      "end_date",
      "isFilter",
      "filter",
    ]);
    let durasi;

    let _filter = filter ? JSON.parse(filter) : null;
    let _isFilter = isFilter ? JSON.parse(isFilter) : null;

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
        data: {},
      });
    }

    const d1 = moment(begin_date).format("YYYY-MM-DD");
    const d2 = moment(end_date).format("YYYY-MM-DD");
    // const prevDay = moment(date).subtract(1, 'days').format('YYYY-MM-DD');

    // const twelveAM = `${now}T00:00:00`;
    // const sixAM = `${now}T06:00:00`;

    // const nTime = moment(time).format("YYYY-MM-DDTHH:mm:ss");

    // const isNightShift = shift === 'NIGHT SHIFT';

    // let txt = '';
    // if (isNightShift && ((new Date(nTime) >= new Date(twelveAM)) && (new Date(nTime) <= new Date(sixAM)))) {
    //     txt = 'You Are AT Night Shift 12 AM - 6 AM';
    //     await FILTER_NIGHT_SHIFT();
    // } else {
    //     txt = 'Morning Shift or Night shift at 18PM - 12AM';
    //     await FILTER_DATE();
    // }

    // console.log('TXT :: ', txt);
    await FILTER_DATE();

    const q = {
      order: { id: 1, value: "created_at" },
      activities: { id: 3, value: "Moving unit to Maintenance" },
      shifts: { id: 1, value: "DAY SHIFT" },
      fleets: { id: 1, value: "Fleet OB-01" },
      pits: { id: 1, value: "RPU BARU" },
    };
    async function FILTER_DATE() {
      try {
        let dailyFleet = null;
        if (_isFilter) {
          console.log("is this fucking running ?");
          dailyFleet = await DailyFleet.query()
            .with("pit", (site) => site.with("site"))
            .with("fleet")
            .with("activities")
            .with("shift")
            .with("user")
            .with("details", (wh) => wh.with("equipment"))
            .where((wh) => {
              wh.where("date", ">=", d1);
              wh.andWhere("date", "<=", d2);
              if (_filter.shifts) {
                wh.andWhere("shift_id", _filter.shifts.id);
              }

              if (_filter.activities) {
                wh.andWhere("activity_id", _filter.activities.id);
              }

              if (_filter.pits) {
                wh.andWhere("pit_id", _filter.pits.id);
              }

              if (_filter.fleets) {
                wh.andWhere("fleet_id", _filter.fleets.id);
              }
            })
            .orderBy([{ column: _filter?.order?.value, order: "desc" }])
            .fetch();
        } else {
          dailyFleet = await DailyFleet.query()
            .with("pit", (site) => site.with("site"))
            .with("fleet")
            .with("activities")
            .with("shift")
            .with("user")
            .with("details", (wh) => wh.with("equipment"))
            .whereBetween("date", [d1, d2])
            .orderBy([{ column: "created_at", order: "desc" }])
            .fetch();
        }


        // const t = await Database.raw(`select mas_fleets.name AS fleet_name, mas_shifts.name AS shift_name, mas_activities.name AS activity_name, mas_pits.name as pit_name from mas_fleets, mas_shifts, mas_activities, mas_pits, v_users, daily_fleet_equips, daily_fleets where mas_fleets.id = daily_fleets.fleet_id and mas_shifts.id = daily_fleets.shift_id and v_users.id = daily_fleets.user_id and daily_fleet_equips.dailyfleet_id = daily_fleets.id and mas_activities.id = daily_fleets.activity_id and mas_pits.id = daily_fleets.pit_id and daily_fleets.date >= '${d1}' and daily_fleets.date <= '${d2}' and (mas_fleets.kode LIKE '%${keyword}%' or mas_shifts.name LIKE '%${keyword}%' or mas_activities.name LIKE '%${keyword}%' or mas_fleets.name LIKE '%${keyword}%' or mas_pits.name LIKE '%${keyword}%')`)

        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyFleet.toJSON(),
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

    // async function FILTER_NIGHT_SHIFT() {
    //     try {
    //     const dailyFleet = await DailyFleet
    //         .query()
    //         .with('pit', site => site.with('site'))
    //         .with('fleet')
    //         .with('activities')
    //         .with('shift')
    //         .with('user')
    //         .where('date', prevDay)
    //         .andWhere('shift_id', 2)
    //         .fetch()

    //     durasi = await diagnoticTime.durasi(t0);
    //     return response.status(200).json({
    //       diagnostic : {
    //         times : durasi,
    //         error : false
    //       },
    //       data : dailyFleet
    //     })
    //   } catch (error) {
    //     console.log(error)
    //     durasi = await diagnoticTime.durasi(t0)
    //     return response.status(400).json({
    //       diagnostic: {
    //         times: durasi,
    //         error: true,
    //         message: error.message,
    //       },
    //       data: [],
    //     })
    //   }
    // }
  }

  async show({ auth, params, request, response }) {
    const { id } = params;
    const req = request.only(["keyword"]);
    var t0 = performance.now();
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
        data: {},
      });
    }

    let dailyFleet;
    if (req.keyword) {
      dailyFleet = await DailyFleet.query()
        .with("pit", (a) => {
          a.where("kode", "like", `%${req.keyword}%`);
          a.orWhere("name", "like", `%${req.keyword}%`);
          a.orWhere("location", "like", `%${req.keyword}%`);
        })
        .with("fleet", (b) => {
          b.where("kode", "like", `%${req.keyword}%`);
          b.orWhere("name", "like", `%${req.keyword}%`);
        })
        .with("activities", (c) => {
          c.where("kode", "like", `%${req.keyword}%`);
          c.orWhere("name", "like", `%${req.keyword}%`);
          c.orWhere("keterangan", "like", `%${req.keyword}%`);
        })
        .with("shift", (d) => {
          d.where("kode", "like", `%${req.keyword}%`);
          d.orWhere("name", "like", `%${req.keyword}%`);
          d.orWhere("duration", "like", `%${req.keyword}%`);
        })
        .with("user")
        .with("details", (e) => {
          e.with("equipment");
        })
        .where({ id: id })
        .first();
    } else {
      dailyFleet = await DailyFleet.query()
        .with("pit")
        .with("fleet")
        .with("activities")
        .with("shift")
        .with("user")
        .with("details", (e) => {
          e.with("equipment");
        })
        .where({ id: id })
        .first();
    }

    let durasi = await diagnoticTime.durasi(t0);
    return response.status(200).json({
      diagnostic: {
        times: durasi,
        error: false,
      },
      data: dailyFleet,
    });
  }

  async moveFleetToOtherPIT({ auth, request, response }) {
    const req = request.only(["dailyfleet_id", "pit_id"]);

    var t0 = performance.now();
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
        data: {},
      });
    }

    const { pit_id, dailyfleet_id } = req;

    let durasi;
    try {
      const cekDailyFleet = await DailyFleet.query()
        .where("id", dailyfleet_id)
        .with('pit')
        .first();

      if (cekDailyFleet) {
        cekDailyFleet.merge({
          pit_id,
        });
        cekDailyFleet.save();
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
            message: "Change PIT Success",
          },
          data: cekDailyFleet,
        });
      }
    } catch (error) {
      console.log(error);
      let durasi = await diagnoticTime.durasi(t0);
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: {},
      });
    }
  }

  async create({ auth, request, response }) {
    const req = request.only([
      "pit_id",
      "fleet_id",
      "activity_id",
      "shift_id",
      "date",
      "tipe",
      "details",
    ]);
    var t0 = performance.now();
    let durasi;
    try {
      const usr = await auth.authenticator("jwt").getUser();
      await resData(usr);
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

    async function resData(usr) {
      const { details } = req;
      const { pit_id, fleet_id, activity_id, shift_id, tipe, date } = req;
      const cekFleet = await DailyFleet.query()
        .where({
          pit_id,
          fleet_id,
          activity_id,
          shift_id,
          date: moment(date).format("YYYY-MM-DD"),
          tipe
        })
        .first();

      if (cekFleet) {
        durasi = await diagnoticTime.durasi(t0);
        return response.status(403).json({
          diagnostic: {
            times: durasi,
            error: true,
            request: { pit_id, fleet_id, activity_id, shift_id, date },
            message: "Fleet exsisting...",
          },
          data: cekFleet,
        });
      }

      const trx = await db.beginTransaction();
      try {
        const dailyFleet = new DailyFleet();
        dailyFleet.fill({
          pit_id,
          fleet_id,
          activity_id,
          shift_id,
          tipe,
          user_id: usr.id,
          date: new Date(date),
        });
        await dailyFleet.save(trx);

        console.log('details >> ', details)
        if(details || details.length > 0) {
          for (const item of details) {
            const dailyFleetEquip = new DailyFleetEquip();
            dailyFleetEquip.fill({
              dailyfleet_id: dailyFleet.id,
              equip_id: item.equip_id,
              datetime: new Date(date),
            });
            await dailyFleetEquip.save(trx);
          }
        } else {
          return response.status(403).json({
            diagnostic: {
              times: durasi,
              error: true,
              message: "Unit Tidak boleh kosong!.",
            },
            data: [],
          });
        }
        
        await trx.commit();
        durasi = await diagnoticTime.durasi(t0);
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyFleet,
        });
      } catch (error) {
        console.log(error);
        await trx.rollback();
        return response.status(404).json({
          diagnostic: {
            times: durasi,
            error: true,
            message: "Failed post",
          },
          data: [],
        });
      }
    }
  }

  async update({ auth, params, request, response }) {
    const { id } = params;
    const req = request.only([
      "pit_id",
      "fleet_id",
      "activity_id",
      "shift_id",
      "tipe",
      "date",
    ]);
    var t0 = performance.now();
    const { pit_id, fleet_id, activity_id, shift_id, tipe, date } = req;
    let durasi;
    try {
      const usr = await auth.authenticator("jwt").getUser();
      const cekDailyFleet = await DailyFleet.query()
        .where({
          pit_id,
          fleet_id,
          activity_id,
          shift_id,
          date: moment(date).format(initString),
        })
        .with("details")
        .first();
      if (cekDailyFleet) {
        durasi = await diagnoticTime.durasi(t0);
        return response.status(403).json({
          diagnostic: {
            times: durasi,
            error: true,
            message: "duplicated daily fleet...",
          },
          data: cekDailyFleet,
        });
      } else {
        const trx = await db.beginTransaction();
        try {
          let dailyFleet = await DailyFleet.findOrFail(id);
          dailyFleet.merge({
            pit_id,
            fleet_id,
            activity_id,
            shift_id,
            tipe,
            date,
          });
          await dailyFleet.save(trx);
          await trx.commit(trx);
          durasi = await diagnoticTime.durasi(t0);
          return response.status(201).json({
            diagnostic: {
              times: durasi,
              error: false,
              detail_update:
                "<" +
                request.hostname() +
                ">/api/daily-fleet-equipment/<PARAMS>/update",
            },
            data: dailyFleet,
          });
        } catch (error) {
          console.log(error);
          await trx.rollback(trx);
        }
      }
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
  }
}

module.exports = DailyFleetApiController;

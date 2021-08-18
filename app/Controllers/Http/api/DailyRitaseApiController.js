"use strict"

const { performance } = require("perf_hooks")
const moment = require("moment")
const DailyRitaseHelpers = use("App/Controllers/Http/Helpers/DailyRitase")
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const DailyFleet = use("App/Models/DailyFleet");
const db = use("Database")
const DailyRitase = use("App/Models/DailyRitase")

class DailyRitaseApiController {
  async index({ auth, request, response }) {
    var t0 = performance.now()
    const req = request.only(["keyword", "page"])

    try {
      await auth.authenticator("jwt").getUser()
    } catch (error) {
      console.log(error)
      let durasi = await diagnoticTime.durasi(t0)
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      })
    }

    try {
      const dailyRitase = await DailyRitaseHelpers.ALL(req)
      let durasi = await diagnoticTime.durasi(t0)
      return response.status(200).json({
        diagnostic: {
          times: durasi,
          error: false,
        },
        data: dailyRitase,
      })
    } catch (error) {
      console.log(error)
      let durasi = await diagnoticTime.durasi(t0)
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error
        },
        data: [],
      })
    }
  }

  /** show data based today and previous day */
  async filterByDate ({ auth, request, response }) {
    var t0 = performance.now()
    const { begin_date, end_date, isFilter, filter } = request.only(["begin_date", "end_date",
    "isFilter",
    "filter",])

    let _filter = filter ? JSON.parse(filter) : null;
    let _isFilter = isFilter ? JSON.parse(isFilter) : null;

    try {
      await auth.authenticator("jwt").getUser()
    } catch (error) {
      console.log(error)
      let durasi = await diagnoticTime.durasi(t0)
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      })
    }

    const d1 = moment(begin_date).format('YYYY-MM-DD');
    const d2 = moment(end_date).format('YYYY-MM-DD');
    // const prevDay = moment(date).subtract(1, 'days').format('YYYY-MM-DD');

    await FILTER_DATE();

    async function FILTER_DATE() {
      try {
        let dailyRitase = null 
        
        if (_isFilter) {
        const dailyFleet = await DailyFleet.query()
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
          if (_filter.pits) {
            wh.andWhere("pit_id", _filter.pits.id);
          }

          if (_filter.fleets) {
            wh.andWhere("fleet_id", _filter.fleets.id);
          }
        })
        .orderBy([{ column: 'created_at', order: "desc" }])
        .first();


        if(dailyFleet) {
          dailyRitase = await DailyRitase
          .query()
          .with('material_details')
          .with('daily_fleet', details => {
              details.with('details', unit => unit.with('equipment'))
              details.with('shift')
              details.with('activities')
              details.with('fleet')
              details.with('pit')
          })
          .where((wh) => {
            wh.where('date', '>=', d1)
            wh.andWhere('date', '<=', d2)
            wh.andWhere('status', 'Y')
            wh.andWhere('dailyfleet_id', dailyFleet?.id)
            if(_filter?.materials?.id) {
              wh.andWhere('material', _filter.materials.id)
            }
          })
          .orderBy([{ column : _filter?.order?.value, order : 'desc' }])
          .fetch()
        } else {
          dailyRitase = []
        }

        } else {
          dailyRitase = await DailyRitase
          .query()
            .with('material_details')
            .with('daily_fleet', details => {
                details.with('details', unit => unit.with('equipment'))
                details.with('shift')
                details.with('activities')
                details.with('fleet')
                details.with('pit')
            })
            .where("status", "Y")
            .whereBetween('date', [d1, d2])
            .orderBy([{ column : 'created_at', order : 'desc' }])
            .fetch()
        }
        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitase,
        })
      } catch (error) {
        console.log(error)
        let durasi = await diagnoticTime.durasi(t0)
        return response.status(403).json({
          diagnostic: {
            times: durasi,
            error: true,
            message: error
          },
          data: [],
        })
      }
    }
  }



  async create({ auth, request, response }) {
    var t0 = performance.now()
    const req = request.only([
      "dailyfleet_id",
      "checker_id",
      "spv_id",
      "material",
      "distance",
      "exca_id",
      "date"
    ])

    let durasi
    try {
      await auth.authenticator("jwt").getUser()
    } catch (error) {
      console.log(error)
      let durasi = await diagnoticTime.durasi(t0)
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      })
    }

    
    await SAVE_DATA()
    
    async function SAVE_DATA() {
      const trx = await db.beginTransaction()
      const dailyRitase = new DailyRitase()
      dailyRitase.fill(req)
      try {
        const checkDailyRitase = 
          await DailyRitase
          .query(trx)
          .where({
            dailyfleet_id: req.dailyfleet_id,
            material: req.material,
            distance: req.distance,
            exca_id : req.exca_id 
          })
          .first()
          
        if(checkDailyRitase){
          throw new Error('Duplicate Data daily ritase...')
        }
        
        await dailyRitase.save(trx)
        await trx.commit(trx)
        durasi = await diagnoticTime.durasi(t0)
        return response.status(201).json({
          diagnostic: {
            times: durasi,
            error: false,
          },
          data: dailyRitase,
        })
      } catch (error) {
          console.log(error)
          await trx.rollback(trx)
          durasi = await diagnoticTime.durasi(t0)
          return response.status(403).json({
            diagnostic: {
              times: durasi,
              error: true,
              message: error
            },
            data: []
          })
      }
    }
  }

  async show ({ auth, params, response }) {
    var t0 = performance.now()
    const { id } = params
    let durasi

    try {
      await auth.authenticator("jwt").getUser()
    } catch (error) {
      console.log(error)
      durasi = await diagnoticTime.durasi(t0)
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      })
    }

    await GET_DATA()

    async function GET_DATA(){
        try {
          const dailyRitase = await DailyRitase
            .query()
            .with('material_details')
            .with('daily_fleet', details => {
              details.with('details', unit => unit.with('equipment'))
            }).where('id', id).first()
          durasi = await diagnoticTime.durasi(t0)
          return response.status(201).json({
            diagnostic: {
              times: durasi,
              error: false,
            },
            data: dailyRitase,
          })
        } catch (error) {
          console.log(error)
          durasi = await diagnoticTime.durasi(t0)
          return response.status(403).json({
            diagnostic: {
              times: durasi,
              error: true,
              message: 'Data not exsist...'
            },
            data: []
          })
        }
    }
  }

  async update ({ auth, params, request, response }) {
    var t0 = performance.now()
    const { id } = params
    const req = request.only([
      "dailyfleet_id",
      "checker_id",
      "spv_id",
      "material",
      "distance",
      "hauler_id",
      "date"
    ])
    let durasi

    try {
      await auth.authenticator("jwt").getUser()
    } catch (error) {
      console.log(error)
      durasi = await diagnoticTime.durasi(t0)
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      })
    }

    await UPDATE_DATA()

    async function UPDATE_DATA(){
      const trx = await db.beginTransaction()
      try {
          const daily_ritase = await DailyRitase.findOrFail(id)
          daily_ritase.merge(req)
          await daily_ritase.save(trx)
          await trx.commit(trx)
          durasi = await diagnoticTime.durasi(t0)
          return response.status(201).json({
            diagnostic: {
              times: durasi,
              error: false,
            },
            data: daily_ritase,
          })
      } catch (error) {
          console.log(error)
          await trx.rollback(trx)
          durasi = await diagnoticTime.durasi(t0)
          return response.status(403).json({
            diagnostic: {
              times: durasi,
              error: true,
              message: error.message,
            },
            data: [],
          })
      }
    }
  }

  async destroy ({ auth, params, response }) {
    var t0 = performance.now()
    const { id } = params
    let durasi

    try {
      await auth.authenticator("jwt").getUser()
    } catch (error) {
      console.log(error)
      durasi = await diagnoticTime.durasi(t0)
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: [],
      })
    }

    await DESTROY_DATA()

    async function DESTROY_DATA(){
        try {
            const dailyRitase = await DailyRitase.findOrFail(id)
            await dailyRitase.delete()
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                  times: durasi,
                  error: false,
                  message: 'Success delete data...'
                },
                data: [],
            })
        } catch (error) {
            console.log(error)
            return response.status(400).json({
                diagnostic: {
                  times: durasi,
                  error: true,
                  message: error.message
                },
                data: [],
            })
        }
    }
  }
}

module.exports = DailyRitaseApiController

"use strict"

const { performance } = require("perf_hooks")
const moment = require("moment")
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const db = use("Database")
const DailyRitase = use("App/Models/DailyRitase")

class DailyRitaseApiController {
  async index({ auth, request, response }) {
    var t0 = performance.now()
    const req = request.only(["keyword", "page"])
    const limit = 10
    const halaman = req.page === undefined ? 1 : parseInt(req.page)

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
      let dailyRitase
      if (req.keyword) {
        dailyRitase = await DailyRitase.query()
          .with('daily_fleet', details => {
            details.with('details', unit => unit.with('equipment'))
          })
          .where(whe => {
              whe.where('material', 'like', `%${req.keyword}%`)
              whe.orWhere('distance', 'like', `%${req.keyword}%`)
              whe.orWhere('date', 'like', `%${req.keyword}%`)
          })
          .andWhere("status", "Y")
          .orderBy('created_at', 'desc')
          .paginate(halaman, limit)
      } else {
        dailyRitase = await DailyRitase.query()
          .with('daily_fleet', details => {
            details.with('details', unit => unit.with('equipment'))
          })
          .where("status", "Y")
          .orderBy('created_at', 'desc')
          .paginate(halaman, limit)
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

  async create({ auth, request, response }) {
    var t0 = performance.now()
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

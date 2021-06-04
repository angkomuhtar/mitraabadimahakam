'use strict'

const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")

class DailyRitaseDetailApiController {
  async index ({ request, response, view }) {
  }

  async create ({ request, response, auth }) {
    var t0 = performance.now()
    const req = request.only(['dailyritase_id', 'checker_id', 'spv_id', 'hauler_id'])
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

    await SAVE_DATA()

    async function SAVE_DATA(){
      const dailyRitaseDetail = new DailyRitaseDetail()
      dailyRitaseDetail.fill({...req, check_in: new Date()})
      try {
        await dailyRitaseDetail.save()
      } catch (error) {
        console.log(error)
        durasi = await diagnoticTime.durasi(t0)
        return response.status(400).json({
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

  async show ({ params, request, response, view }) {
  }

  async edit ({ params, request, response, view }) {
  }

  async update ({ params, request, response }) {
  }

  async destroy ({ params, request, response }) {
  }
}

module.exports = DailyRitaseDetailApiController

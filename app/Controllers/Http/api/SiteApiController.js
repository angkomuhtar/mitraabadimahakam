'use strict'
const diagnoticTime = use('App/Controllers/Http/customClass/diagnoticTime')
const { performance } = require('perf_hooks')
const Site = use('App/Models/MasSite')

class SiteApiController {
  async index({ auth, request, response }) {
    var t0 = performance.now()
    console.log(performance)
    const req = request.only(['keyword'])
    try {
      await auth.authenticator('jwt').getUser()
    } catch (error) {
      console.log(error)
      let durasi = await diagnoticTime.durasi(t0)
      return response.status(403).json({
        diagnostic: {
          times: durasi,
          error: true,
          message: error.message,
        },
        data: {},
      })
    }

    let pit
    if (req.keyword) {
      pit = await Site.query()
        .where(word => {
          word.where('kode', 'like', `%${req.keyword}%`)
          word.orWhere('name', 'like', `%${req.keyword}%`)
        })
        .andWhere({ status: 'Y' })
        .fetch()
    } else {
      pit = await Site.query().where({ status: 'Y' }).fetch()
    }

    let durasi = await diagnoticTime.durasi(t0)
    return response.status(200).json({
      diagnostic: {
        times: durasi,
        error: false,
      },
      data: pit,
    })
  }
}

module.exports = SiteApiController

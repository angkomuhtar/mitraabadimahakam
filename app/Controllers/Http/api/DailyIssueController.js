'use strict'

const db = use('Database')
const moment = require('moment')
// const MamIssue = use("App/Models/MamIssue");
const { performance } = require('perf_hooks')
const IssueHelpers = use('App/Controllers/Http/Helpers/DailyIssue')
const diagnoticTime = use(
     'App/Controllers/Http/customClass/diagnoticTime'
)

class DailyIssueController {
     async index({ auth, request, response }) {
          let durasi
          var t0 = performance.now()
          const req = request.all()

          try {
               await auth.authenticator('jwt').getUser()
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

          try {
               let datax = (await IssueHelpers.ALL(req)).toJSON()
               const { data } = datax
               let result = data.map(elm => {
                    let diff
                    let timing
                    var a = moment(elm.report_at)
                    var b = moment(elm.end_at)
                    var c = b ? b.diff(a) / 60000 : null

                    if (!c) {
                         diff = null
                         timing = null
                    }
                    if (c < 60) {
                         diff = parseInt(c)
                         timing = 'minutes'
                    }
                    if (c >= 60) {
                         diff = parseInt(c / 60)
                         timing = 'hours'
                    }
                    if (c >= 1140) {
                         diff = parseInt(c / (60 * 24))
                         timing = 'days'
                    }
                    return {
                         ...elm,
                         durasi: diff,
                         timing: timing,
                    }
               })

               durasi = await diagnoticTime.durasi(t0)
               return response.status(200).json({
                    diagnostic: {
                         times: durasi,
                         error: false,
                    },
                    data: { ...datax, data: result },
               })
          } catch (error) {
               console.log(error)
               durasi = await diagnoticTime.durasi(t0)
               return response.status(403).json({
                    diagnostic: {
                         times: durasi,
                         error: true,
                         message: error,
                    },
                    data: [],
               })
          }
     }

     async show({ auth, params, response }) {
          console.log(params)
          let durasi
          var t0 = performance.now()
          try {
               await auth.authenticator('jwt').getUser()
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

          try {
               let result = await IssueHelpers.SHOW(params)
               let diff
               let timing
               var a = moment(result.report_at)
               var b = moment(result.end_at)
               var c = b ? b.diff(a) / 60000 : null

               if (!c) {
                    diff = null
                    timing = null
               }
               if (c < 60) {
                    diff = parseInt(c)
                    timing = 'minutes'
               }
               if (c >= 60) {
                    diff = parseInt(c / 60)
                    timing = 'hours'
               }
               if (c >= 1140) {
                    diff = parseInt(c / (60 * 24))
                    timing = 'days'
               }

               durasi = await diagnoticTime.durasi(t0)
               return response.status(200).json({
                    diagnostic: {
                         times: durasi,
                         error: false,
                    },
                    data: {
                         ...result,
                         durasi: diff,
                         timing: timing,
                    },
               })
          } catch (error) {
               console.log(error)
               durasi = await diagnoticTime.durasi(t0)
               return response.status(403).json({
                    diagnostic: {
                         times: durasi,
                         error: true,
                         message: error,
                    },
                    data: {},
               })
          }
     }

     async filterDate({ auth, response, request }) {
          let durasi
          var t0 = performance.now()
          try {
               await auth.authenticator('jwt').getUser()
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

          try {
               let result = await IssueHelpers.SHOW_BY_DATE(request.all())
               let diff
               let timing
               var a = moment(result.report_at)
               var b = moment(result.end_at)
               var c = b ? b.diff(a) / 60000 : null

               if (!c) {
                    diff = null
                    timing = null
               }
               if (c < 60) {
                    diff = parseInt(c)
                    timing = 'minutes'
               }
               if (c >= 60) {
                    diff = parseInt(c / 60)
                    timing = 'hours'
               }
               if (c >= 1140) {
                    diff = parseInt(c / (60 * 24))
                    timing = 'days'
               }

               durasi = await diagnoticTime.durasi(t0)
               return response.status(200).json({
                    diagnostic: {
                         times: durasi,
                         error: false,
                    },
                    data: result,
               })
          } catch (error) {
               console.log(error)
               durasi = await diagnoticTime.durasi(t0)
               return response.status(403).json({
                    diagnostic: {
                         times: durasi,
                         error: true,
                         message: error,
                    },
                    data: {},
               })
          }
     }
}

module.exports = DailyIssueController
